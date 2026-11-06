-- ============================================================================
-- TRIGGER DE CONTROLE AUTOMÁTICO DE ESTOQUE E STATUS DO PRODUTO POR PEDIDO
-- Execute este script no SQL Editor do Supabase
-- ============================================================================

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
BEGIN
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

  -- 2. Quando um item é REMOVIDO do pedido (DELETE - ex: exclusão ou troca de item na edição)
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
    -- Caso o mesmo produto tenha apenas a quantidade alterada
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

    -- Caso o produto do item tenha sido trocado por outro produto
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
