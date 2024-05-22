import { useEffect, useState } from "react";
import { DataGrid } from "@material-ui/data-grid";
import Button from "@material-ui/core/Button";
import Box from "@material-ui/core/Box";
import { styled } from "@material-ui/core/styles";
import CircularProgress from "@material-ui/core/CircularProgress";
import Snackbar from "@material-ui/core/Snackbar";
import Alert from "@material-ui/lab/Alert";
import UserDetails from "./UserDetails";

const StyledBox = styled(Box)({
  height: 40,
  display: "flex",
  justifyContent: "flex-end",
  marginTop: 10,
});

export default function UsersList(props) {
  const [users, setUsers] = useState({ result: { data: [] } });
  const [page, setPage] = useState(0);
  const [showDetail, setShowDetail] = useState(false);
  const [userId, setUserId] = useState(0);
  const [pageSize, setPageSize] = useState(5);
  const [loading, setLoading] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMsg, setAlertMsg] = useState("");

  useEffect(() => {
    fetchUsers();
  }, [page, pageSize]);

  async function fetchUsers() {
    let response = await fetch(
      props.apiUrl +
        "?_page=" +
        //first page is 1 for the json server API
        //Material DataGrid first page is 0
        (page + 1) +
        "&_limit=" +
        pageSize
    );
    let json = await response.json();
    response = {
      total: response.headers.get("x-total-Count"),
      data: json,
    };
    setUsers({ result: { total: response.total, data: response.data } });
  }

  let userIdSelected = 0;

  const columns = [
    { field: "id", headerName: "ID", width: 60 },
    { field: "name", headerName: "Name", width: 180, editable: true },
    { field: "username", headerName: "UserName", width: 200, editable: true },
    { field: "email", headerName: "Email", width: 250, editable: true },
    {
      field: "action",
      headerName: "Action",
      width: 250,
      renderCell: (params) => (
        <Button
          variant="contained"
          color="primary"
          size="small"
          style={{ marginLeft: 16 }}
          onClick={() => openDetails(params.row.id)}
        >
          More...
        </Button>
      ),
    },
  ];

  function openDetails(rowId) {
    setUserId(rowId);
    setShowDetail(true);
  }

  function closeDetails() {
    setShowDetail(false);
  }

  async function handleDelete() {
    if (userIdSelected === 0) {
      setAlertMsg("Please, select a row of the grid first");
      setShowAlert(true);
      return;
    }

    setLoading(true);

    await fetch(props.apiUrl + "/" + userIdSelected, {
      method: "DELETE",
    });

    setLoading(false);
    setAlertMsg("User Deleted Successfully");
    setShowAlert(true);
    //refresh the grid data after delete
    fetchUsers();
  }

  function handleCloseAlert() {
    setShowAlert(false);
  }

  async function handleEditing(params) {
    console.log("asdf: " + params.field);
    console.log("asdf: " + [params.field]);
    await fetch(props.apiUrl + "/" + params.id, {
      method: "PUT",
      body: JSON.stringify({
        id: params.id,
        [params.field]: params.props.value,
      }),
      headers: {
        "Content-type": "application/json; charset=UTF-8",
      },
    });
    setAlertMsg("User Updated Successfully");
    setShowAlert(true);
  }

  return (
    <>
      <div style={{ height: 420, width: "100%" }}>
        <DataGrid
          rows={users.result.data}
          columns={columns}
          pageSize={pageSize}
          paginationMode="server"
          page={page}
          onPageChange={(params) => {
            setPage(params.page);
          }}
          onPageSizeChange={(params) => {
            setPageSize(params.pageSize);
          }}
          rowsPerPageOptions={[3, 5]}
          rowCount={parseInt(users.result.total)}
          //to delete the selected row
          onRowSelected={(e) => (userIdSelected = e.data.id)}
          //editing
          onEditCellChangeCommitted={(params) => handleEditing(params)}
          disableColumnMenu={true}
        />
      </div>
      <div>
        <StyledBox component="div">
          <Button variant="contained" color="primary" onClick={handleDelete}>
            {loading && <CircularProgress color="inherit" size={24} />}
            {!loading && "Delete Selected User"}
          </Button>
        </StyledBox>
      </div>
      <UserDetails
        apiUrl={props.apiUrl}
        userId={userId}
        show={showDetail}
        handleClose={closeDetails}
      />
      <Snackbar
        anchorOrigin={{
          vertical: "top",
          horizontal: "center",
        }}
        open={showAlert}
        autoHideDuration={3000}
        onClose={handleCloseAlert}
      >
        <Alert severity="success">{alertMsg}</Alert>
      </Snackbar>
    </>
  );
}
