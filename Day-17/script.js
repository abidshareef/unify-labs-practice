// Mock database of student projects
const studentProjects = [
    { id: 1, projectName: "E-commerce Website", status: "Completed", budget: 1200 },
    { id: 2, projectName: "Mobile App Development", status: "Pending", budget: 2500 },
    { id: 3, projectName: "Data Visualization Tool", status: "Completed", budget: 800 },
    { id: 4, projectName: "AI Chatbot", status: "Pending", budget: 3200 },
    { id: 5, projectName: "Blockchain Explorer", status: "Completed", budget: 1500 },
    { id: 6, projectName: "IoT Home System", status: "Pending", budget: 2100 },
    { id: 7, projectName: "Cloud Storage Solution", status: "Completed", budget: 950 },
    { id: 8, projectName: "Cybersecurity Framework", status: "Pending", budget: 1800 }
];

// Display raw data
document.getElementById('raw-data').textContent = JSON.stringify(studentProjects, null, 2);

// Process data with filter, map, and reduce

// 1. Filter tasks into 'Completed' and 'Pending'
const completedTasks = studentProjects.filter(task => task.status === "Completed");
const pendingTasks = studentProjects.filter(task => task.status === "Pending");

// Update task statistics
document.getElementById('total-tasks').textContent = studentProjects.length;
document.getElementById('completed-tasks').textContent = completedTasks.length;
document.getElementById('pending-tasks').textContent = pendingTasks.length;

// Display completed tasks
const completedList = document.getElementById('completed-list');
completedTasks.forEach(task => {
    const li = document.createElement('li');
    li.className = 'completed';
    li.innerHTML = `<span>${task.projectName}</span><span>$${task.budget}</span>`;
    completedList.appendChild(li);
});

// Display pending tasks
const pendingList = document.getElementById('pending-list');
pendingTasks.forEach(task => {
    const li = document.createElement('li');
    li.className = 'pending';
    li.innerHTML = `<span>${task.projectName}</span><span>$${task.budget}</span>`;
    pendingList.appendChild(li);
});

// 2. Map over budgets to calculate with tax (7%)
const TAX_RATE = 0.07;
const projectsWithTax = studentProjects.map(project => {
    return {
        ...project,
        budgetWithTax: project.budget * (1 + TAX_RATE)
    };
});

// Display projects with tax applied
const projectsWithTaxList = document.getElementById('projects-with-tax');
projectsWithTax.forEach(project => {
    const li = document.createElement('li');
    li.innerHTML = `
        <span>${project.projectName}</span>
        <span>$${project.budget} → $${project.budgetWithTax.toFixed(2)}</span>
    `;
    projectsWithTaxList.appendChild(li);
});

// 3. Reduce budgets to calculate totals
const preTaxTotal = studentProjects.reduce((sum, project) => sum + project.budget, 0);
const taxAmount = preTaxTotal * TAX_RATE;
const totalBudget = preTaxTotal + taxAmount;

// Update budget statistics
document.getElementById('pre-tax-budget').textContent = `$${preTaxTotal}`;
document.getElementById('tax-amount').textContent = `$${taxAmount.toFixed(2)}`;
document.getElementById('total-budget').textContent = `$${totalBudget.toFixed(2)}`;

// Add some animation for visual interest
document.querySelectorAll('.card').forEach(card => {
    card.addEventListener('mouseenter', () => {
        card.style.transform = 'translateY(-5px)';
    });
    
    card.addEventListener('mouseleave', () => {
        card.style.transform = 'translateY(0)';
    });
});
