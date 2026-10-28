import NavBar from "../../navbar/NavBar.tsx";

const Dashboard = () => {
  return (
    <div className={"flex"}>
      <NavBar option="DASHBOARD" />

      <h1>Relatório</h1>
    </div>
  );
};

export default Dashboard;