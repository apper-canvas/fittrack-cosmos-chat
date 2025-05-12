export const membershipPlanService = {
  fetchMembershipPlans: async () => {
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
          { Field: { Name: "description" } },
          { Field: { Name: "price" } },
          { Field: { Name: "duration" } },
          { Field: { Name: "type" } }
        ],
        orderBy: [
          { field: "price", direction: "ASC" }
        ],
        pagingInfo: {
          limit: 50,
          offset: 0
        }
      };
      
      const response = await apperClient.fetchRecords("membership_plan", params);
      return response.data;
    } catch (error) {
      console.error("Error fetching membership plans:", error);
      throw error;
    }
  },
  
  fetchMembershipPlanById: async (planId) => {
    try {
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });
      
      const response = await apperClient.getRecordById("membership_plan", planId);
      return response.data;
    } catch (error) {
      console.error(`Error fetching membership plan with ID ${planId}:`, error);
      throw error;
    }
  },
  
  createMembershipPlan: async (planData) => {
    try {
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });
      
      const params = {
        records: [planData]
      };
      
      const response = await apperClient.createRecord("membership_plan", params);
      
      if (response && response.success && response.results && response.results[0].success) {
        return response.results[0].data;
      } else {
        throw new Error(response.results ? response.results[0].message : "Failed to create membership plan");
      }
    } catch (error) {
      console.error("Error creating membership plan:", error);
      throw error;
    }
  },
  
  updateMembershipPlan: async (planData) => {
    try {
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });
      
      const params = {
        records: [planData]
      };
      
      const response = await apperClient.updateRecord("membership_plan", params);
      
      if (response && response.success && response.results && response.results[0].success) {
        return response.results[0].data;
      } else {
        throw new Error(response.results ? response.results[0].message : "Failed to update membership plan");
      }
    } catch (error) {
      console.error("Error updating membership plan:", error);
      throw error;
    }
  },
  
  deleteMembershipPlan: async (planId) => {
    try {
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });
      
      const params = {
        RecordIds: [planId]
      };
      
      const response = await apperClient.deleteRecord("membership_plan", params);
      
      if (response && response.success) {
        return true;
      } else {
        throw new Error("Failed to delete membership plan");
      }
    } catch (error) {
      console.error(`Error deleting membership plan with ID ${planId}:`, error);
      throw error;
    }
  }
};

export default membershipPlanService;