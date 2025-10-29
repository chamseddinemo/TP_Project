import api from "./api";

// ============= EMPLOYÉS =============
export const getEmployees = async () => {
  const response = await api.get("/rh/employees");
  return response.data;
};

export const addEmployee = async (employee) => {
  const response = await api.post("/rh/employees", employee);
  return response.data;
};

export const updateEmployee = async (id, employee) => {
  const response = await api.put(`/rh/employees/${id}`, employee);
  return response.data;
};

export const deleteEmployee = async (id) => {
  const response = await api.delete(`/rh/employees/${id}`);
  return response.data;
};

export const getEmployeeById = async (id) => {
  const response = await api.get(`/rh/employees/${id}`);
  return response.data;
};

// ============= RECRUTEMENT =============
export const getJobOffers = async () => {
  const response = await api.get("/rh/job-offers");
  return response.data;
};

export const createJobOffer = async (offer) => {
  const response = await api.post("/rh/job-offers", offer);
  return response.data;
};

export const updateJobOffer = async (id, offer) => {
  const response = await api.put(`/rh/job-offers/${id}`, offer);
  return response.data;
};

export const deleteJobOffer = async (id) => {
  const response = await api.delete(`/rh/job-offers/${id}`);
  return response.data;
};

export const getApplications = async (offerId) => {
  const response = await api.get(`/rh/applications${offerId ? `?offerId=${offerId}` : ""}`);
  return response.data;
};

export const createApplication = async (application) => {
  const response = await api.post("/rh/applications", application);
  return response.data;
};

export const updateApplicationStatus = async (id, status, note) => {
  const response = await api.put(`/rh/applications/${id}`, { status, note });
  return response.data;
};

export const sendInterviewInvitation = async (applicationId, interviewData) => {
  const response = await api.post(`/rh/applications/${applicationId}/invite`, interviewData);
  return response.data;
};

// ============= FEUILLES DE TEMPS =============
export const getTimesheets = async (employeeId, month, year) => {
  const response = await api.get(`/rh/timesheets?employeeId=${employeeId}&month=${month}&year=${year}`);
  return response.data;
};

export const saveTimesheet = async (timesheet) => {
  const response = await api.post("/rh/timesheets", timesheet);
  return response.data;
};

export const updateTimesheet = async (id, timesheet) => {
  const response = await api.put(`/rh/timesheets/${id}`, timesheet);
  return response.data;
};

export const exportTimesheetPDF = async (employeeId, month, year) => {
  const response = await api.get(`/rh/timesheets/export/pdf?employeeId=${employeeId}&month=${month}&year=${year}`, {
    responseType: 'blob'
  });
  return response.data;
};

export const exportTimesheetExcel = async (employeeId, month, year) => {
  const response = await api.get(`/rh/timesheets/export/excel?employeeId=${employeeId}&month=${month}&year=${year}`, {
    responseType: 'blob'
  });
  return response.data;
};

// ============= PAIE & CONTRATS =============
export const getPayslips = async (employeeId, year) => {
  const response = await api.get(`/rh/payslips?employeeId=${employeeId}&year=${year}`);
  return response.data;
};

export const generatePayslip = async (employeeId, month, year) => {
  const response = await api.post("/rh/payslips/generate", { employeeId, month, year });
  return response.data;
};

export const getContracts = async (employeeId) => {
  const response = await api.get(`/rh/contracts${employeeId ? `?employeeId=${employeeId}` : ""}`);
  return response.data;
};

export const createContract = async (contract) => {
  const response = await api.post("/rh/contracts", contract);
  return response.data;
};

export const updateContract = async (id, contract) => {
  const response = await api.put(`/rh/contracts/${id}`, contract);
  return response.data;
};

export const getLeaves = async (employeeId) => {
  const response = await api.get(`/rh/leaves${employeeId ? `?employeeId=${employeeId}` : ""}`);
  return response.data;
};

export const requestLeave = async (leave) => {
  const response = await api.post("/rh/leaves", leave);
  return response.data;
};

export const updateLeaveStatus = async (id, status) => {
  const response = await api.put(`/rh/leaves/${id}`, { status });
  return response.data;
};
