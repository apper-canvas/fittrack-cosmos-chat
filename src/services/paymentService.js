export const paymentService = {
  fetchPayments: async () => {
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
          { Field: { Name: "memberId" } },
          { Field: { Name: "amount" } },
          { Field: { Name: "date" } },
          { Field: { Name: "paymentMethod" } },
          { Field: { Name: "description" } }
        ],
        expands: [
          { name: "memberId", alias: "member" }
        ],
        orderBy: [
          { field: "date", direction: "DESC" }
        ],
        pagingInfo: {
          limit: 100,
          offset: 0
        }
      };
      
      const response = await apperClient.fetchRecords("payment", params);
      return response.data;
    } catch (error) {
      console.error("Error fetching payments:", error);
      throw error;
    }
  },
  
  fetchPaymentById: async (paymentId) => {
    try {
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });
      
      const response = await apperClient.getRecordById("payment", paymentId);
      return response.data;
    } catch (error) {
      console.error(`Error fetching payment with ID ${paymentId}:`, error);
      throw error;
    }
  },
  
  createPayment: async (paymentData) => {
    try {
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });
      
      const params = {
        records: [paymentData]
      };
      
      const response = await apperClient.createRecord("payment", params);
      
      if (response && response.success && response.results && response.results[0].success) {
        // Create activity record for payment
        const memberResponse = await apperClient.getRecordById("member", paymentData.memberId);
        const member = memberResponse.data;
        
        if (member) {
          const activityParams = {
            records: [{
              Name: `${member.firstName} ${member.lastName} payment`,
              type: "payment",
              time: new Date().toLocaleTimeString(),
              date: new Date().toISOString().split('T')[0],
              amount: paymentData.amount
            }]
          };
          
          await apperClient.createRecord("Activity1", activityParams);
        }
        
        return response.results[0].data;
      } else {
        throw new Error(response.results ? response.results[0].message : "Failed to create payment");
      }
    } catch (error) {
      console.error("Error creating payment:", error);
      throw error;
    }
  },
  
  updatePayment: async (paymentData) => {
    try {
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });
      
      const params = {
        records: [paymentData]
      };
      
      const response = await apperClient.updateRecord("payment", params);
      
      if (response && response.success && response.results && response.results[0].success) {
        return response.results[0].data;
      } else {
        throw new Error(response.results ? response.results[0].message : "Failed to update payment");
      }
    } catch (error) {
      console.error("Error updating payment:", error);
      throw error;
    }
  },
  
  deletePayment: async (paymentId) => {
    try {
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });
      
      const params = {
        RecordIds: [paymentId]
      };
      
      const response = await apperClient.deleteRecord("payment", params);
      
      if (response && response.success) {
        return true;
      } else {
        throw new Error("Failed to delete payment");
      }
    } catch (error) {
      console.error(`Error deleting payment with ID ${paymentId}:`, error);
      throw error;
    }
  },
  
  fetchPaymentsByMember: async (memberId) => {
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
          { Field: { Name: "memberId" } },
          { Field: { Name: "amount" } },
          { Field: { Name: "date" } },
          { Field: { Name: "paymentMethod" } },
          { Field: { Name: "description" } }
        ],
        where: [
          {
            fieldName: "memberId",
            Operator: "ExactMatch",
            values: [memberId]
          }
        ],
        orderBy: [
          { field: "date", direction: "DESC" }
        ],
        pagingInfo: {
          limit: 100,
          offset: 0
        }
      };
      
      const response = await apperClient.fetchRecords("payment", params);
      return response.data;
    } catch (error) {
      console.error(`Error fetching payments for member ID ${memberId}:`, error);
      throw error;
    }
  },
  
  fetchRecentPayments: async (limit = 5) => {
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
          { Field: { Name: "memberId" } },
          { Field: { Name: "amount" } },
          { Field: { Name: "date" } },
          { Field: { Name: "paymentMethod" } },
          { Field: { Name: "description" } }
        ],
        expands: [
          { name: "memberId", alias: "member" }
        ],
        orderBy: [
          { field: "date", direction: "DESC" }
        ],
        pagingInfo: {
          limit: limit,
          offset: 0
        }
      };
      
      const response = await apperClient.fetchRecords("payment", params);
      return response.data;
    } catch (error) {
      console.error("Error fetching recent payments:", error);
      throw error;
    }
  }
};

export default paymentService;