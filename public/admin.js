// admin.js
function DateFormat(date) {
  var d = new Date(date),
    month = '' + (d.getMonth() + 1),
    day = '' + d.getDate(),
    year = d.getFullYear();

  if (month.length < 2) 
    month = '0' + month;
  if (day.length < 2) 
    day = '0' + day;

  return [year, month, day].join('-');
}

// Display Current Date
function displayCurrentDate() {
  const dateElement = document.getElementById('currentDate');
  const today = new Date();
  const day = String(today.getDate()).padStart(2, '0');
  const monthIndex = today.getMonth();
  const year = today.getFullYear();
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const formattedDate = `${day} ${monthNames[monthIndex]} ${year}`;
  dateElement.textContent = formattedDate;
}

// Call the function to set the date
displayCurrentDate();

document.addEventListener('DOMContentLoaded', function () {
    var modeSwitch = document.querySelector('.mode-switch');
  
    modeSwitch.addEventListener('click', function () {                    
      document.documentElement.classList.toggle('dark');
      modeSwitch.classList.toggle('active');
    });
    
    var listView = document.querySelector('.list-view');
    var gridView = document.querySelector('.grid-view');
    var projectsList = document.querySelector('.project-boxes');
    
    listView.addEventListener('click', function () {
      gridView.classList.remove('active');
      listView.classList.add('active');
      projectsList.classList.remove('jsGridView');
      projectsList.classList.add('jsListView');
    });
    
    gridView.addEventListener('click', function () {
      gridView.classList.add('active');
      listView.classList.remove('active');
      projectsList.classList.remove('jsListView');
      projectsList.classList.add('jsGridView');
    });
    
    document.querySelector('.messages-btn').addEventListener('click', function () {
      document.querySelector('.messages-section').classList.add('show');
    });
    
    document.querySelector('.messages-close').addEventListener('click', function() {
      document.querySelector('.messages-section').classList.remove('show');
    });

    // Initial call to fetch projects and display total project count

  });


  
// to create project-box
function createProjectBox(project) {
  const projectContainer = document.getElementById('project-boxes'); // Ensure this ID matches your HTML
  const projectBox = document.createElement('div');
  projectBox.classList.add('project-box');
  projectBox.innerHTML = `
      <div class="project-box-header">${project.tender_addition_date}</div>
      <div class="project-box-content">
          <h4>${project.tender_id}</h4>
          <p>${project.tender_name}</p>
      </div>
      <button class="project-btn-more" onclick="showProjectDetails(${project.id})">
          <i class="fas fa-ellipsis-v"></i>
      </button>
  `;
  projectContainer.appendChild(projectBox);
  location.reload();
}

// Add new project form
document.addEventListener('DOMContentLoaded', function () {

  // Get modal and close icon elements
  const modal = document.getElementById("addProjectModal");
  const addBtn = document.querySelector(".add-btn");
  const closeIcon = document.getElementById("close-form-icon");

  // Show modal on button click
  if (addBtn) {
    addBtn.onclick = function () {
      modal.style.display = "block";
    };
  }

  // Close modal when close icon is clicked
  if (closeIcon) {
    closeIcon.addEventListener('click', function () {
      modal.style.display = "none"; // Close the modal
    });
  }

  // Close modal when clicking outside of the modal content
  window.onclick = function (event) {
    if (event.target === modal) {
      modal.style.display = "none";
    }
  };

  // Get the form element
  const addProjectForm = document.getElementById('addProjectForm');

  // Add event listener for the form submission
 // Get form data when the form is submitted
addProjectForm.addEventListener('submit', function (e) {
  e.preventDefault(); // Prevent page reload

  // Collect project form data
  const tenderId = document.getElementById('tenderId').value;
  const tenderName = document.getElementById('tenderName').value;
  const tenderPortal = document.getElementById('tenderPortal').value;
  const tia = document.getElementById('tia').value;
  const tenderAdditionDate = document.getElementById('tenderAdditionDate').value;
  const remark = document.getElementById('remark').value;
  const startDate = document.getElementById('startDate').value;
  const endDate = document.getElementById('endDate').value;

  // Validate required fields
  if (!tenderId || !tenderName || !tenderPortal || !tia || !tenderAdditionDate || !startDate || !endDate) {
    alert("Please fill all required fields.");
    return;
  }

  // Prepare FormData for file upload
  const formData = new FormData();
  const files = document.getElementById('tenderDocument').files;  // Changed from tenderFile to tenderDocument
  for (let i = 0; i < files.length; i++) {
    formData.append('tenderDocument[]', files[i]);  // Corrected the field name to match the input
  }

  // Append project data to FormData
  formData.append('tenderId', tenderId);
  formData.append('tenderName', tenderName);
  formData.append('tenderPortal', tenderPortal);
  formData.append('tia', tia);
  formData.append('tenderAdditionDate', tenderAdditionDate);
  formData.append('remark', remark);
  formData.append('startDate', startDate);
  formData.append('endDate', endDate);

  // Collect employee roles
  Array.from(document.querySelectorAll('.employee-role')).forEach(roleElement => {
    formData.append('employeeId[]', roleElement.querySelector('input[name="employeeId[]"]').value);
    formData.append('employeeName[]', roleElement.querySelector('input[name="employeeName[]"]').value);
    formData.append('role[]', roleElement.querySelector('input[name="role[]"]').value);
  });

  // Send form data to the server
  fetch('/add-project', {
    method: 'POST',
    body: formData
  })
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      alert("Project added successfully!");
      addProjectForm.reset(); // Clear form after successful submission
      modal.style.display = "none"; // Close the modal

      // Call createProjectBox with the new project details
      createProjectBox({
        id: data.projectId, // Ensure this is returned from your server after inserting
        tenderAdditionDate: tenderAdditionDate,
        tenderId: tenderId,
        tenderName: tenderName,
        endDate: endDate,
        participantNames: data.employeeNames // Assuming this is returned from the server
      });

    } else {
      alert("Error adding project: " + data.message);
    }
  })
  .catch(error => {
    console.error("Error:", error);
    alert("An error occurred while adding the project.");
  });
});

});

// Create project box dynamically after successful submission
function createProjectBox(project) {
  const projectSection = document.getElementById('project-section');
  const projectBox = document.createElement('div');
  projectBox.classList.add('project-box');
  projectBox.innerHTML = `
    <div class="box-content-header">Tender ID: ${project.tenderId}</div>
    <div class="box-content-subheader">Tender Name: ${project.tenderName}</div>
    <div class="box-content-footer">Participants: ${project.participantNames.join(', ')}</div>
    <div class="box-footer">
      <button class="file-btn" onclick="openProjectFile(${project.id})">View Files</button>
    </div>
  `;
  projectSection.appendChild(projectBox);
}

// Open project file from the server's uploads folder
function openProjectFile(projectId) {
  fetch(`/get-project-file/${projectId}`)
    .then(response => response.json())
    .then(data => {
      if (data.success && data.filePath) {
        window.open(data.filePath, '_blank');
      } else {
        alert("No file found for this project.");
      }
    })
    .catch(error => {
      console.error("Error:", error);
      alert("An error occurred while opening the project file.");
    });
}



// *****************************************************************
// Fetch and display existing projects when the page loads
document.addEventListener('DOMContentLoaded', fetchProjects);

// Function to blend a color with black
function blendWithBlack(color, amount) {
  let r = parseInt(color.slice(1, 3), 16);
  let g = parseInt(color.slice(3, 5), 16);
  let b = parseInt(color.slice(5, 7), 16);

  r = Math.floor(r * (1 - amount));
  g = Math.floor(g * (1 - amount));
  b = Math.floor(b * (1 - amount));

  r = Math.max(0, Math.min(255, r));
  g = Math.max(0, Math.min(255, g));
  b = Math.max(0, Math.min(255, b));

  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

// Function to fetch projects from the database and display them
async function fetchProjects() {
  const response = await fetch('/api/projects');
  const projects = await response.json();

   // Sort projects based on days left, placing "Date Over" projects last
   projects.sort((a, b) => {
    const daysLeftA = calculateDaysLeft(a.start_date, a.end_date);
    const daysLeftB = calculateDaysLeft(b.start_date, b.end_date);

    // If daysLeftA or daysLeftB is "Date Over", sort accordingly
    if (daysLeftA === "Date Over" && daysLeftB !== "Date Over") return 1;
    if (daysLeftB === "Date Over" && daysLeftA !== "Date Over") return -1;

    // Otherwise, sort by the number of days left (ascending order)
    return daysLeftA - daysLeftB;
  });

  const searchQuery = document.querySelector('.search-input').value.toLowerCase();

  let filteredProjects = projects.filter(project =>
    project.tender_name.toLowerCase().includes(searchQuery)
  );

  let remainingProjects = projects.filter(project =>
    !project.tender_name.toLowerCase().includes(searchQuery)
  );

  remainingProjects = remainingProjects.sort((a, b) =>
    calculateDaysLeft(a.start_date, a.end_date) - calculateDaysLeft(b.start_date, b.end_date)
  );

  const sortedProjects = [...filteredProjects, ...remainingProjects];

  const projectBoxes = document.getElementById('project-boxes');
  projectBoxes.innerHTML = '';

  const colors = [
    '#d5deff', '#ffe5d5', '#d5ffde', '#ffd5e5', '#d5d5ff',
    '#d5fffa', '#fae5d5', '#e5d5ff', '#d5f0ff'
  ];

  for (const [index, project] of sortedProjects.entries()) {
    const projectBox = document.createElement('div');
    projectBox.className = 'project-box-wrapper';

    const color = colors[index % colors.length];
    const blackishColor = blendWithBlack(color, 0.4);

    const tenderAdditionDate = new Date(project.tender_addition_date);
    const formattedDate = `${String(tenderAdditionDate.getDate()).padStart(2, '0')}:${String(tenderAdditionDate.getMonth() + 1).padStart(2, '0')}:${tenderAdditionDate.getFullYear()}`;

    const daysLeft = calculateDaysLeft(project.start_date, project.end_date);

    const currentDate = new Date();
    const startDate = new Date(project.start_date);
    const endDate = new Date(project.end_date);

    let status;
    if (currentDate < startDate) {
      status = "Pending";
    } else if (currentDate <= endDate) {
      status = "Project is Running";
    } else if (endDate <= currentDate) {
      status = "Completed";
    }

    const assignedEmployeesCount = await getAssignedEmployeesCount(project.id);

    const daysLeftText = typeof daysLeft === "number" && !isNaN(daysLeft)
      ? `${Math.abs(daysLeft)} Days ${daysLeft >= 0 ? 'Left' : 'Overdue'}`
      : "Date Over";

    projectBox.innerHTML = `
      <div class="project-box" style="background-color: ${color};">
        <div class="project-box-header">
          <span>${formattedDate}</span>
          <div class="more-wrapper">
            <button class="project-btn-more" onclick="showProjectDetails(${project.id})">
              <i class="fas fa-ellipsis-v" width="24" height="24"></i>
            </button>
          </div>
        </div>
        <div class="project-box-content-header">
          <p class="box-content-header">${project.tender_name}</p>
          <p class="box-content-subheader">${status}</p>
        </div>
        <div class="project-box-footer">
          <div class="participants">
            <div class="assigned-employee-count" style="color: ${blackishColor};">
              ${assignedEmployeesCount}
            </div>
          </div>
          <div class="days-left" style="color: ${blackishColor};">
            ${daysLeftText}
          </div>
        </div>
      </div>
    `;

    projectBoxes.appendChild(projectBox);
  }
  updateProjectCount();
}

// Helper function to calculate days left or "Date Over"
function calculateDaysLeft(startDate, endDate) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const today = new Date();

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return "Date Over";
  }

  if (today > end) {
    return "Date Over";
  }

  const timeDifference = end - today;
  const daysLeft = Math.ceil(timeDifference / (1000 * 60 * 60 * 24));

  return daysLeft >= 0 ? daysLeft : 0;
}

// Function to get the count of assigned employees
async function getAssignedEmployeesCount(projectId) {
  try {
    const response = await fetch(`/api/projects/${projectId}/employee-count`);
    const data = await response.json();
    return data.employeeCount || 0;
  } catch (error) {
    console.error('Error fetching employee count:', error);
    return 0;
  }
}

// Event listener for search input
document.querySelector('.search-input').addEventListener('input', fetchProjects);

// Function to calculate days left or return "Date Over"
function calculateDaysLeft(startDate, endDate) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const today = new Date();

  // Check if the dates are valid
  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return "Date Over"; // Return a message if the date is invalid
  }

  if (today > end) {
      return "Date Over"; // If the current date is after the end date
  }

  const timeDifference = end - today;
  const daysLeft = Math.ceil(timeDifference / (1000 * 60 * 60 * 24));

  return daysLeft >= 0 ? daysLeft : 0;
}


// Show project details in the modal
function showProjectDetails(projectId) {
  fetch(`/api/projects/${projectId}`)
    .then(response => response.json())
    .then(project => {
      // Update modal title
      document.getElementById('modalTitle').innerText = project.tender_name;

      // Populate project details in the modal
      document.getElementById('projectDetails').innerHTML = `
        <table class="project-details-table">
          <tr>
            <th>Tender ID</th>
            <td>${project.tender_id}</td>
          </tr>
          <tr>
            <th>Tender Name</th>
            <td>${project.tender_name}</td>
          </tr>
          <tr>
            <th>Tender Portal</th>
            <td>${project.tender_portal}</td>
          </tr>
          <tr>
            <th>TIA</th>
            <td>${project.tia}</td>
          </tr>
          <tr>
            <th>Remark</th>
            <td>${project.remark}</td>
          </tr>
          <tr>
           <tr>
            <th>Documents</th>
            <td> <a href="./image/USER_AUTHENTICATION_AND_SHIFT_MANAGEMENT_Revised.pdf" target="_blank">
    USER_AUTHENTICATION_AND_SHIFT_MANAGEMENT_Revised.pdf
  </a></td>
          </tr>
            <th>Start Date</th>
            <td>${DateFormat(project.start_date)}</td>
          </tr>
          <tr>
            <th>End Date</th>
            <td>${DateFormat(project.end_date)}</td>
          </tr>
        </table>
      `;

      // Display assigned employees if available
      if (project.assignedEmployees && project.assignedEmployees.length > 0) {
        const employeeRows = project.assignedEmployees.map(emp => `
          <tr>
            <td>${emp.name}</td>
            <td>${emp.role}</td>
          </tr>
        `).join('');

        document.getElementById('assignedEmployees').innerHTML = `
          <h3>Assigned Employees</h3>
          <table class="employees-table">
            <tr>
              <th>Employee Name</th>
              <th>Role</th>
            </tr>
            ${employeeRows}
          </table>
        `;
      } else {
        document.getElementById('assignedEmployees').innerHTML = '<p>No employees assigned.</p>';
      }

      // Display uploaded documents if available
      if (project.uploadedDocuments && project.uploadedDocuments.length > 0) {
        const documentLinks = project.uploadedDocuments.map(doc => `
          <li><a href="/uploads/${doc}" target="_blank">${doc}</a></li>
        `).join('');

        document.getElementById('uploadedDocuments').innerHTML = `
          <h3>Uploaded Documents</h3>
          <ul class="documents-list">
            ${documentLinks}
          </ul>
        `;
      } else {
        document.getElementById('uploadedDocuments').innerHTML = '<p>No documents uploaded.</p>';
      }

      // Set event handlers for update and remove buttons
      document.getElementById('updateButton').onclick = () => openUpdateForm(project);
      document.getElementById('removeButton').onclick = () => confirmRemoveProject(project.id);

      // Show the modal
      document.getElementById('projectCardModal').style.display = 'block';
    })
    .catch(err => {
      console.error('Error fetching project details:', err);
      alert('Failed to load project details. Please try again later.');
    });
}


// Helper function to format dates (adjust as per your format needs)
function DateFormat(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString(); // Customize as needed
}

// Open update form for the project (You can define this as per your update logic)
function openUpdateForm(project) {
  // Populate form fields with the project data
  document.getElementById('updateTenderId').value = project.tender_id;
  document.getElementById('updateTenderName').value = project.tender_name;
  document.getElementById('updateTenderPortal').value = project.tender_portal;
  document.getElementById('updateTia').value = project.tia;
  document.getElementById('updateRemark').value = project.remark;
  document.getElementById('updateStartDate').value = project.start_date;
  document.getElementById('updateEndDate').value = project.end_date;

  // Show update form modal
  document.getElementById('updateProjectModal').style.display = 'block';
}

// Function to confirm and remove the project
function confirmRemoveProject(projectId) {
  if (confirm('Are you sure you want to remove this project?')) {
    fetch(`/api/projects/remove/${projectId}`, { method: 'DELETE' })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          alert('Project removed successfully!');
          document.getElementById('projectCardModal').style.display = 'none'; // Close modal
          // Optionally, remove the project from the page or reload the project list
        } else {
          alert('Error removing project: ' + data.message);
        }
      })
      .catch(err => {
        console.error('Error removing project:', err);
        alert('An error occurred while removing the project.');
      });
  }
}


// Remove project from the database
function removeProject(projectId) {
fetch(`/api/projects/${projectId}`, { method: 'DELETE' })
    .then(response => response.json())
    .then(data => {
        alert(data.message);
        closeModal(); // Close the project modal if open
        location.reload(); // Refresh the page to reflect changes
    })
    .catch(err => console.error(err));
}

// Handle project updates
document.getElementById('updateProjectForm').onsubmit = function(event) {
event.preventDefault(); // Prevent form from refreshing the page

              const projectId = document.getElementById('updateProjectId').value;
              const tenderId = document.getElementById('updateTenderId').value;
              const tenderName = document.getElementById('updateTenderName').value;
              const tenderPortal = document.getElementById('updateTenderPortal').value;
              const remark = document.getElementById('updateRemark').value;
              const startDate = document.getElementById('updateStartDate').value;
              const endDate = document.getElementById('updateEndDate').value;

              const roles = Array.from(document.querySelectorAll('.employee-role-template input[name="updateRole[]"]'))
                                  .map((input, index) => ({
                                    employeeId: document.querySelectorAll('.employee-role-template input[name="updateEmployeeId[]"]')[index].value,
                                    employeeName: document.querySelectorAll('.employee-role-template input[name="updateEmployeeName[]"]')[index].value,
                                    role: input.value
                                  }));
                                  

fetch(`/api/projects/${projectId}`, {
    method: 'PUT',
    headers: {
        'Content-Type': 'application/json',
    },
    body: JSON.stringify({
        updatedData: {
            tender_id: tenderId,
            tender_name: tenderName,
            tender_portal: tenderPortal,
            tia: document.getElementById('updateTia').value,
            remark: remark,
            start_date: startDate,
            end_date: endDate
        },
        rolesToUpdate: roles
    })
})
.then(response => response.json())
.then(data => {
    if (data.message) {
        alert("Project updated successfully");
        closeUpdateModal();
        closeModal(); //close projectCardModal card
        fetchProjects(); // Refresh project list
    } else {
        alert("Failed to update project");
    }
})
.catch(error => console.error('Error updating project:', error));
};

document.getElementById('addUpdateEmployeeRoleBtn').onclick = function() {
const roleDiv = document.createElement('div');
roleDiv.classList.add('employee-role-template');
roleDiv.innerHTML = `
    <label for="updateEmployeeId">Employee ID:</label>
    <input type="text" name="updateEmployeeId[]" required>
    <label for="updateEmployeeName">Employee Name:</label>
    <input type="text" name="updateEmployeeName[]" required>
    <label for="updateRole">Role:</label>
    <input type="text" name="updateRole[]" required>
    <button type="button" class="removeEmployeeBtn">Remove</button>
`;

// Attach the event to remove the employee role when the remove button is clicked
roleDiv.querySelector('.removeEmployeeBtn').onclick = function() {
    roleDiv.remove();
};

document.getElementById('updateEmployeeRoleContainer').appendChild(roleDiv);
};

function closeUpdateModal() {
document.getElementById('updateProjectModal').style.display = 'none';
}

// ********************************************
// To Count Total number of Project and In Progress and completed
function updateProjectCount() {
  // Get the total number of project boxes
  const projectBoxes = document.querySelectorAll('.project-box');
  const totalProjects = projectBoxes.length;

  // Count the number of In Progress projects (Running or Not Started Yet)
  const inProgressCount = [...projectBoxes].filter(box => {
      const statusText = box.querySelector('.box-content-subheader').textContent;
      return statusText === "Project is Running" || statusText === "Pending";
  }).length;

  // Count the number of Completed projects
  const completedCount = [...projectBoxes].filter(box => {
      const statusText = box.querySelector('.box-content-subheader').textContent;
      return statusText === "Completed";
  }).length;

  // Update the counts in the UI
  document.getElementById('in-progress-count').textContent = inProgressCount;
  document.getElementById('total-projects').textContent = inProgressCount + completedCount;
  document.getElementById('completed-count').textContent = completedCount;
}

// Call updateProjectCount when the page loads to display the initial count
window.addEventListener('load', updateProjectCount);


// ******************************************************

document.getElementById("addEmployeeRoleBtn").addEventListener("click", function () {
const employeeRoleContainer = document.getElementById("employeeRoleContainer");

// Create a new div for the additional employee role inputs
const newEmployeeRoleDiv = document.createElement("div");
newEmployeeRoleDiv.classList.add("employee-role");

// Add Employee ID input
const employeeIdLabel = document.createElement("label");
employeeIdLabel.textContent = "Employee ID:";
newEmployeeRoleDiv.appendChild(employeeIdLabel);

const employeeIdInput = document.createElement("input");
employeeIdInput.type = "text";
employeeIdInput.name = "employeeId[]";
employeeIdInput.required = true;
newEmployeeRoleDiv.appendChild(employeeIdInput);

// Add Employee Name input
const employeeNameLabel = document.createElement("label");
employeeNameLabel.textContent = "Employee Name:";
newEmployeeRoleDiv.appendChild(employeeNameLabel);

const employeeNameInput = document.createElement("input");
employeeNameInput.type = "text";
employeeNameInput.name = "employeeName[]";
employeeNameInput.required = true;
newEmployeeRoleDiv.appendChild(employeeNameInput);

// Add Role input
const roleLabel = document.createElement("label");
roleLabel.textContent = "Role:";
newEmployeeRoleDiv.appendChild(roleLabel);

const roleInput = document.createElement("input");
roleInput.type = "text";
roleInput.name = "role[]";
roleInput.required = true;
newEmployeeRoleDiv.appendChild(roleInput);

// Add the new employee role div to the container
employeeRoleContainer.appendChild(newEmployeeRoleDiv);
});














