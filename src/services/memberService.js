export const memberService = {
  fetchMembers: async () => {
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
          { Field: { Name: "firstName" } },
          { Field: { Name: "lastName" } },
          { Field: { Name: "email" } },
          { Field: { Name: "phone" } },
          { Field: { Name: "membershipType" } },
          { Field: { Name: "emergencyContact" } },
          { Field: { Name: "checkedIn" } },
          { Field: { Name: "expiryDate" } }
        ],
        pagingInfo: {
          limit: 100,
          offset: 0
        }
      };
      
      const response = await apperClient.fetchRecords("member", params);
      return response.data;
    } catch (error) {
      console.error("Error fetching members:", error);
      throw error;
    }
  },
  
  fetchMemberById: async (memberId) => {
    try {
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });
      
      const response = await apperClient.getRecordById("member", memberId);
      return response.data;
    } catch (error) {
      console.error(`Error fetching member with ID ${memberId}:`, error);
      throw error;
    }
  },
  
  createMember: async (memberData) => {
    try {
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });
      
      const params = {
        records: [memberData]
      };
      
      const response = await apperClient.createRecord("member", params);
      
      if (response && response.success && response.results && response.results[0].success) {
        return response.results[0].data;
      } else {
        throw new Error(response.results ? response.results[0].message : "Failed to create member");
      }
    } catch (error) {
      console.error("Error creating member:", error);
      throw error;
    }
  },
  
  updateMember: async (memberData) => {
    try {
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });
      
      const params = {
        records: [memberData]
      };
      
      const response = await apperClient.updateRecord("member", params);
      
      if (response && response.success && response.results && response.results[0].success) {
        return response.results[0].data;
      } else {
        throw new Error(response.results ? response.results[0].message : "Failed to update member");
      }
    } catch (error) {
      console.error("Error updating member:", error);
      throw error;
    }
  },
  
  deleteMember: async (memberId) => {
    try {
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });
      
      const params = {
        RecordIds: [memberId]
      };
      
      const response = await apperClient.deleteRecord("member", params);
      
      if (response && response.success) {
        return true;
      } else {
        throw new Error("Failed to delete member");
      }
    } catch (error) {
      console.error(`Error deleting member with ID ${memberId}:`, error);
      throw error;
    }
  },
  
  checkInMember: async (memberId) => {
    try {
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });
      
      // First get the member to preserve all fields
      const memberResponse = await apperClient.getRecordById("member", memberId);
      const member = memberResponse.data;
      
      if (!member) {
        throw new Error("Member not found");
      }
      
      // Update check-in status
      const params = {
        records: [{
          Id: memberId,
          checkedIn: true
        }]
      };
      
      const response = await apperClient.updateRecord("member", params);
      
      if (response && response.success && response.results && response.results[0].success) {
        // Create activity record for check-in
        const activityParams = {
          records: [{
            Name: `${member.firstName} ${member.lastName} check-in`,
            type: "check-in",
            time: new Date().toLocaleTimeString(),
            date: new Date().toISOString().split('T')[0]
          }]
        };
        
        await apperClient.createRecord("Activity1", activityParams);
        
        return response.results[0].data;
      } else {
        throw new Error(response.results ? response.results[0].message : "Failed to check in member");
      }
    } catch (error) {
      console.error(`Error checking in member with ID ${memberId}:`, error);
      throw error;
    }
  }
};

export default memberService;