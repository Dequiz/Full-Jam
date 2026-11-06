-- ============================================================================
-- TRIGGER DE CONTROLE AUTOMÁTICO DE ESTOQUE E STATUS DO PRODUTO POR PEDIDO
-- Atualizado para tratar Pedidos CANCELADOS (devolve estoque ao cancelar)
-- Execute este script no SQL Editor do Supabase
-- ============================================================================

-- 1. Função de trigger para mudanças nos ITENS do pedido (Item_Pedido)
CREATE OR REPLACE FUNCTION public.fn_atualizar_estoque_item_pedido()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_estoque_atual integer;
  v_novo_estoque integer;
  v_nome_produto varchar;
  v_diferenca integer;
  v_status_pedido text;
BEGIN
  -- Identifica o status do pedido pai
  IF (TG_OP = 'DELETE') THEN
    SELECT "STATUS" INTO v_status_pedido FROM public."Pedido" WHERE "ID_PEDIDO" = OLD."ID_PEDIDO";
  ELSE
    SELECT "STATUS" INTO v_status_pedido FROM public."Pedido" WHERE "ID_PEDIDO" = NEW."ID_PEDIDO";
  END IF;

  -- Se o pedido for CANCELADO, os itens não retêm estoque
  IF (v_status_pedido = 'CANCELADO') THEN
    IF (TG_OP = 'DELETE') THEN
      RETURN OLD;
    ELSE
      RETURN NEW;
    END IF;
  END IF;

  -- 1. Quando um item é ADICIONADO ao pedido (INSERT)
  IF (TG_OP = 'INSERT') THEN
    SELECT "QUANTIDADE_ESTOQUE", "NOME"
      INTO v_estoque_atual, v_nome_produto
      FROM public."Produto"
     WHERE "ID_PRODUTO" = NEW."ID_PRODUTO"
       FOR UPDATE;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Produto (%) não encontrado no estoque.', NEW."ID_PRODUTO";
    END IF;

    IF v_estoque_atual < NEW."QUANTIDADE" THEN
      RAISE EXCEPTION 'Estoque insuficiente para o produto "%". Disponível: %, Solicitado: %.',
        v_nome_produto, v_estoque_atual, NEW."QUANTIDADE";
    END IF;

    v_novo_estoque := v_estoque_atual - NEW."QUANTIDADE";

    UPDATE public."Produto"
       SET "QUANTIDADE_ESTOQUE" = v_novo_estoque,
           "ATIVO" = CASE WHEN v_novo_estoque <= 0 THEN false ELSE "ATIVO" END
     WHERE "ID_PRODUTO" = NEW."ID_PRODUTO";

    RETURN NEW;

  -- 2. Quando um item é REMOVIDO do pedido (DELETE)
  ELSIF (TG_OP = 'DELETE') THEN
    SELECT "QUANTIDADE_ESTOQUE"
      INTO v_estoque_atual
      FROM public."Produto"
     WHERE "ID_PRODUTO" = OLD."ID_PRODUTO"
       FOR UPDATE;

    IF FOUND THEN
      v_novo_estoque := v_estoque_atual + OLD."QUANTIDADE";

      UPDATE public."Produto"
         SET "QUANTIDADE_ESTOQUE" = v_novo_estoque,
             "ATIVO" = CASE WHEN v_novo_estoque > 0 THEN true ELSE false END
       WHERE "ID_PRODUTO" = OLD."ID_PRODUTO";
    END IF;

    RETURN OLD;

  -- 3. Quando um item do pedido é ATUALIZADO (UPDATE)
  ELSIF (TG_OP = 'UPDATE') THEN
    IF (OLD."ID_PRODUTO" = NEW."ID_PRODUTO") THEN
      v_diferenca := NEW."QUANTIDADE" - OLD."QUANTIDADE";

      IF v_diferenca <> 0 THEN
        SELECT "QUANTIDADE_ESTOQUE", "NOME"
          INTO v_estoque_atual, v_nome_produto
          FROM public."Produto"
         WHERE "ID_PRODUTO" = NEW."ID_PRODUTO"
           FOR UPDATE;

        IF v_estoque_atual < v_diferenca THEN
          RAISE EXCEPTION 'Estoque insuficiente para o produto "%". Disponível: %, Adicional solicitado: %.',
            v_nome_produto, v_estoque_atual, v_diferenca;
        END IF;

        v_novo_estoque := v_estoque_atual - v_diferenca;

        UPDATE public."Produto"
           SET "QUANTIDADE_ESTOQUE" = v_novo_estoque,
               "ATIVO" = CASE WHEN v_novo_estoque <= 0 THEN false ELSE true END
         WHERE "ID_PRODUTO" = NEW."ID_PRODUTO";
      END IF;
    ELSE
      -- Devolve a quantidade ao produto antigo
      SELECT "QUANTIDADE_ESTOQUE"
        INTO v_estoque_atual
        FROM public."Produto"
       WHERE "ID_PRODUTO" = OLD."ID_PRODUTO"
         FOR UPDATE;

      IF FOUND THEN
        v_novo_estoque := v_estoque_atual + OLD."QUANTIDADE";
        UPDATE public."Produto"
           SET "QUANTIDADE_ESTOQUE" = v_novo_estoque,
               "ATIVO" = CASE WHEN v_novo_estoque > 0 THEN true ELSE false END
         WHERE "ID_PRODUTO" = OLD."ID_PRODUTO";
      END IF;

      -- Desconta a quantidade do novo produto
      SELECT "QUANTIDADE_ESTOQUE", "NOME"
        INTO v_estoque_atual, v_nome_produto
        FROM public."Produto"
       WHERE "ID_PRODUTO" = NEW."ID_PRODUTO"
         FOR UPDATE;

      IF NOT FOUND THEN
        RAISE EXCEPTION 'Novo produto (%) não encontrado no estoque.', NEW."ID_PRODUTO";
      END IF;

      IF v_estoque_atual < NEW."QUANTIDADE" THEN
        RAISE EXCEPTION 'Estoque insuficiente para o produto "%". Disponível: %, Solicitado: %.',
          v_nome_produto, v_estoque_atual, NEW."QUANTIDADE";
      END IF;

      v_novo_estoque := v_estoque_atual - NEW."QUANTIDADE";

      UPDATE public."Produto"
         SET "QUANTIDADE_ESTOQUE" = v_novo_estoque,
             "ATIVO" = CASE WHEN v_novo_estoque <= 0 THEN false ELSE "ATIVO" END
       WHERE "ID_PRODUTO" = NEW."ID_PRODUTO";
    END IF;

    RETURN NEW;
  END IF;

  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS trg_atualizar_estoque_item_pedido ON public."Item_Pedido";

CREATE TRIGGER trg_atualizar_estoque_item_pedido
BEFORE INSERT OR UPDATE OR DELETE ON public."Item_Pedido"
FOR EACH ROW
EXECUTE FUNCTION public.fn_atualizar_estoque_item_pedido();

-- 2. Função de trigger para mudança de STATUS do próprio Pedido (ex: cancelar ou reativar)
CREATE OR REPLACE FUNCTION public.fn_atualizar_estoque_status_pedido()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  r RECORD;
  v_estoque_atual integer;
  v_novo_estoque integer;
BEGIN
  -- Se o pedido foi cancelado (STATUS alterado para 'CANCELADO'): Devolve itens ao estoque
  IF (OLD."STATUS" <> 'CANCELADO' AND NEW."STATUS" = 'CANCELADO') THEN
    FOR r IN SELECT "ID_PRODUTO", "QUANTIDADE" FROM public."Item_Pedido" WHERE "ID_PEDIDO" = NEW."ID_PEDIDO"
    LOOP
      SELECT "QUANTIDADE_ESTOQUE" INTO v_estoque_atual FROM public."Produto" WHERE "ID_PRODUTO" = r."ID_PRODUTO" FOR UPDATE;
      IF FOUND THEN
        v_novo_estoque := v_estoque_atual + r."QUANTIDADE";
        UPDATE public."Produto"
           SET "QUANTIDADE_ESTOQUE" = v_novo_estoque,
               "ATIVO" = CASE WHEN v_novo_estoque > 0 THEN true ELSE false END
         WHERE "ID_PRODUTO" = r."ID_PRODUTO";
      END IF;
    END LOOP;

  -- Se o pedido estava cancelado e foi reativado (STATUS alterado de 'CANCELADO' para outro): Baixa itens do estoque
  ELSIF (OLD."STATUS" = 'CANCELADO' AND NEW."STATUS" <> 'CANCELADO') THEN
    FOR r IN SELECT "ID_PRODUTO", "QUANTIDADE" FROM public."Item_Pedido" WHERE "ID_PEDIDO" = NEW."ID_PEDIDO"
    LOOP
      SELECT "QUANTIDADE_ESTOQUE" INTO v_estoque_atual FROM public."Produto" WHERE "ID_PRODUTO" = r."ID_PRODUTO" FOR UPDATE;
      IF FOUND THEN
        v_novo_estoque := GREATEST(0, v_estoque_atual - r."QUANTIDADE");
        UPDATE public."Produto"
           SET "QUANTIDADE_ESTOQUE" = v_novo_estoque,
               "ATIVO" = CASE WHEN v_novo_estoque <= 0 THEN false ELSE "ATIVO" END
         WHERE "ID_PRODUTO" = r."ID_PRODUTO";
      END IF;
    END LOOP;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_atualizar_estoque_status_pedido ON public."Pedido";

CREATE TRIGGER trg_atualizar_estoque_status_pedido
AFTER UPDATE OF "STATUS" ON public."Pedido"
FOR EACH ROW
EXECUTE FUNCTION public.fn_atualizar_estoque_status_pedido();
