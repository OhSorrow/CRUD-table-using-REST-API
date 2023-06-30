//dark mode

document.addEventListener("DOMContentLoaded", function () {
  const darkModeToggle = document.querySelector("#darkModeToggle");
  const html = document.querySelector("html");

  checkDarkMode();

  darkModeToggle.addEventListener("click", toggleDarkMode);

  function checkDarkMode() {
    if (localStorage.getItem("darkModeEnabled") === "true") {
      enableDarkMode();
    }
  }

  function toggleDarkMode() {
    if (html.getAttribute("data-bs-theme") === "dark") {
      disableDarkMode();
    } else {
      enableDarkMode();
    }
  }

  function enableDarkMode() {
    html.setAttribute("data-bs-theme", "dark");
    localStorage.setItem("darkModeEnabled", "true");
  }

  function disableDarkMode() {
    html.setAttribute("data-bs-theme", "light");
    localStorage.setItem("darkModeEnabled", "false");
  }
});

//Get data from the database

$(document).ready(function () {
  $("#myTable").DataTable({
    ajax: {
      url: "https://aram-api.onrender.com/employees/",
      dataSrc: "",
    },
    columns: [
      { data: "firstName" },
      { data: "lastName" },
      { data: "age" },
      { data: "email", orderable: false },
      { data: "salary" },
      { data: "date" },
      {
        data: null,
        orderable: false,
        render: function (data, type, row) {
          return (
            '<div class="d-flex justify-content-center">' +
            '<i class="fas fa-edit edit-icon" data-id="' +
            data._id +
            '"></i>' +
            '<i class="fas fa-trash delete-icon" data-id="' +
            data._id +
            '"></i> </div>'
          );
        },
      },
    ],
    scrollX: true,
    scrollY: true,
    autoWidth: false,
  });
  // Handle the "New" button click event
  $("#newButton").click(function () {
    // Open the modal window
    $("#addEmployeeModal").modal("show");
  });

  // Handle the "Save" button click event
  $("#addEmployeeModal").on("click", ".btn-primary", function () {
    // Get form fields values
    var firstName = $("#firstName").val();
    var lastName = $("#lastName").val();
    var age = parseInt($("#age").val());
    var email = $("#email").val();
    var salary = parseFloat($("#salary").val());
    var date = $("#date").val();

    // Check if any required field is empty
    if (!firstName || !lastName || !age || !email || !salary || !date) {
      // Show an error using SweetAlert2
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Please fill all required fields properly!",
      });
      return; // Stop further execution
    }

    // Add employee using json
    $.ajax({
      url: "https://aram-api.onrender.com/employees/",
      type: "POST",
      data: JSON.stringify({
        firstName: firstName,
        lastName: lastName,
        age: age,
        email: email,
        salary: salary,
        date: date,
      }),
      contentType: "application/json; charset=utf-8",
      //reload the table if success
      success: function () {
        Swal.fire(
          "Successful!",
          `${firstName} ${lastName}'s data has been added.`,
          "success"
        );

        $("#myTable").DataTable().ajax.reload();
        //reset input fields
        $("#addEmployeeModal input").val("");
      },
      //error handler
      error: function (xhr, status, error) {
        Swal.fire({
          icon: "error",
          title: "Oops...",
          text: "Something went wrong!",
        });
        console.log("Error adding employee:", error);
      },
    });
    // Close the modal window
    $("#addEmployeeModal").modal("hide");
  });
});

//Handle the edit icon click event
$(document).ready(function () {
  let table = $("#myTable").DataTable();
  let data;

  // Handle the edit icon click event
  $("#myTable").on("click", ".edit-icon", function () {
    data = table.row($(this).closest("tr")).data();
    let modal = $("#editEmployeeModal");

    // Fill the form fields with the row data
    modal.find("#firstName").val(data.firstName);
    modal.find("#lastName").val(data.lastName);
    modal.find("#age").val(data.age);
    modal.find("#email").val(data.email);
    modal.find("#salary").val(data.salary);
    modal.find("#date").val(data.date);

    // Show the edit modal
    modal.modal("show");
  });

  // Handle the save button click event
  $("#editEmployeeModal").on("click", ".btn-primary", function () {
    let modal = $(this).closest("#editEmployeeModal");

    // Get the updated data from the form fields
    var updatedData = {
      firstName: modal.find("#firstName").val(),
      lastName: modal.find("#lastName").val(),
      age: parseInt(modal.find("#age").val()),
      email: modal.find("#email").val(),
      salary: parseFloat(modal.find("#salary").val()),
      date: modal.find("#date").val(),
    };

    // Check if any required field is empty
    if (
      !updatedData.firstName ||
      !updatedData.lastName ||
      !updatedData.age ||
      !updatedData.email ||
      !updatedData.salary ||
      !updatedData.date
    ) {
      // Show an error using SweetAlert2
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Please fill all required fields properly!",
      });
      return; // Stop further execution
    }

    // Perform the PATCH request to the API
    $.ajax({
      url: "https://aram-api.onrender.com/employees/" + data._id,
      type: "PATCH",
      data: JSON.stringify(updatedData),
      contentType: "application/json",
      success: function () {
        Swal.fire(
          "Successful!",
          `${data.firstName} ${data.lastName}'s data has been updated.`,
          "success"
        );

        // Reload the table after successful update
        table.ajax.reload();
      },
      error: function (xhr, status, error) {
        Swal.fire({
          icon: "error",
          title: "Oops...",
          text: "Something went wrong!",
        });
        console.log("Error updating employee:", error);
      },
    });

    // Hide the edit modal
    $("#editEmployeeModal").modal("hide");
  });
});

// delete items
$(document).ready(function () {
  // Handle the delete icon click event
  $("#myTable").on("click", ".delete-icon", function () {
    var employeeId = $(this).data("id");
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then((result) => {
      if (result.isConfirmed) {
        // Send the delete request
        $.ajax({
          url: "https://aram-api.onrender.com/employees/" + employeeId,
          type: "DELETE",
          success: function () {
            // Reload the table after successful deletion
            Swal.fire("Deleted!", "The employee has been deleted.", "success");
            $("#myTable").DataTable().ajax.reload();
          },
          error: function (error) {
            Swal.fire({
              icon: "error",
              title: "Oops...",
              text: "Something went wrong!",
            });
            console.error("Error deleting employee:", error);
          },
        });
      }
    });
  });
});
