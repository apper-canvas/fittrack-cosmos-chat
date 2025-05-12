export const classScheduleService = {
  fetchClassSchedules: async () => {
    try {
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });
      
      const params = {
        Fields: [
          { Field: { Name: "Id" } },
          { Field: { Name: "Name" } },
          { Field: { Name: "className" } },
          { Field: { Name: "instructor" } },
          { Field: { Name: "startTime" } },
          { Field: { Name: "endTime" } },
          { Field: { Name: "capacity" } }
        ],
        orderBy: [
          { field: "startTime", direction: "ASC" }
        ],
        pagingInfo: {
          limit: 100,
          offset: 0
        }
      };
      
      const response = await apperClient.fetchRecords("class_schedule", params);
      return response.data;
    } catch (error) {
      console.error("Error fetching class schedules:", error);
      throw error;
    }
  },
  
  fetchClassScheduleById: async (scheduleId) => {
    try {
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });
      
      const response = await apperClient.getRecordById("class_schedule", scheduleId);
      return response.data;
    } catch (error) {
      console.error(`Error fetching class schedule with ID ${scheduleId}:`, error);
      throw error;
    }
  },
  
  createClassSchedule: async (scheduleData) => {
    try {
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });
      
      const params = {
        records: [scheduleData]
      };
      
      const response = await apperClient.createRecord("class_schedule", params);
      
      if (response && response.success && response.results && response.results[0].success) {
        return response.results[0].data;
      } else {
        throw new Error(response.results ? response.results[0].message : "Failed to create class schedule");
      }
    } catch (error) {
      console.error("Error creating class schedule:", error);
      throw error;
    }
  },
  
  updateClassSchedule: async (scheduleData) => {
    try {
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });
      
      const params = {
        records: [scheduleData]
      };
      
      const response = await apperClient.updateRecord("class_schedule", params);
      
      if (response && response.success && response.results && response.results[0].success) {
        return response.results[0].data;
      } else {
        throw new Error(response.results ? response.results[0].message : "Failed to update class schedule");
      }
    } catch (error) {
      console.error("Error updating class schedule:", error);
      throw error;
    }
  },
  
  deleteClassSchedule: async (scheduleId) => {
    try {
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });
      
      const params = {
        RecordIds: [scheduleId]
      };
      
      const response = await apperClient.deleteRecord("class_schedule", params);
      
      if (response && response.success) {
        return true;
      } else {
        throw new Error("Failed to delete class schedule");
      }
    } catch (error) {
      console.error(`Error deleting class schedule with ID ${scheduleId}:`, error);
      throw error;
    }
  },
  
  fetchUpcomingClasses: async (limit = 5) => {
    try {
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });
      
      // Get today's date at start of day
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const params = {
        Fields: [
          { Field: { Name: "Id" } },
          { Field: { Name: "Name" } },
          { Field: { Name: "className" } },
          { Field: { Name: "instructor" } },
          { Field: { Name: "startTime" } },
          { Field: { Name: "endTime" } },
          { Field: { Name: "capacity" } }
        ],
        where: [
          {
            fieldName: "startTime",
            Operator: "GreaterThanOrEqualTo",
            values: [today.toISOString()]
          }
        ],
        orderBy: [
          { field: "startTime", direction: "ASC" }
        ],
        pagingInfo: {
          limit: limit,
          offset: 0
        }
      };
      
      const response = await apperClient.fetchRecords("class_schedule", params);
      return response.data;
    } catch (error) {
      console.error("Error fetching upcoming classes:", error);
      throw error;
    }
  }
};

export default classScheduleService;