export const activityService = {
  fetchActivities: async (limit = 20) => {
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
          { Field: { Name: "type" } },
          { Field: { Name: "time" } },
          { Field: { Name: "amount" } },
          { Field: { Name: "className" } },
          { Field: { Name: "date" } }
        ],
        orderBy: [
          { field: "date", direction: "DESC" },
          { field: "time", direction: "DESC" }
        ],
        pagingInfo: {
          limit: limit,
          offset: 0
        }
      };
      
      const response = await apperClient.fetchRecords("Activity1", params);
      return response.data;
    } catch (error) {
      console.error("Error fetching activities:", error);
      throw error;
    }
  },
  
  fetchActivityById: async (activityId) => {
    try {
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });
      
      const response = await apperClient.getRecordById("Activity1", activityId);
      return response.data;
    } catch (error) {
      console.error(`Error fetching activity with ID ${activityId}:`, error);
      throw error;
    }
  },
  
  createActivity: async (activityData) => {
    try {
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });
      
      const params = {
        records: [activityData]
      };
      
      const response = await apperClient.createRecord("Activity1", params);
      
      if (response && response.success && response.results && response.results[0].success) {
        return response.results[0].data;
      } else {
        throw new Error(response.results ? response.results[0].message : "Failed to create activity");
      }
    } catch (error) {
      console.error("Error creating activity:", error);
      throw error;
    }
  },
  
  fetchActivitiesByDateRange: async (startDate, endDate) => {
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
          { Field: { Name: "type" } },
          { Field: { Name: "time" } },
          { Field: { Name: "amount" } },
          { Field: { Name: "className" } },
          { Field: { Name: "date" } }
        ],
        where: [
          {
            fieldName: "date",
            Operator: "GreaterThanOrEqualTo",
            values: [startDate]
          },
          {
            fieldName: "date",
            Operator: "LessThanOrEqualTo",
            values: [endDate]
          }
        ],
        orderBy: [
          { field: "date", direction: "DESC" },
          { field: "time", direction: "DESC" }
        ],
        pagingInfo: {
          limit: 100,
          offset: 0
        }
      };
      
      const response = await apperClient.fetchRecords("Activity1", params);
      return response.data;
    } catch (error) {
      console.error(`Error fetching activities for date range ${startDate} to ${endDate}:`, error);
      throw error;
    }
  }
};

export default activityService;