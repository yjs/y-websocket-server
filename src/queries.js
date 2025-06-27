// GraphQL queries for AWS AppSync

export const PERMISSION_DELIVERABLE_QUERY = `
  query PermissionDeliverable($deliverableId: ID!) {
    permissionDeliverable(deliverableId: $deliverableId) {
      success {
        permissions
      }
      errors {
        ... on InvalidInputError {
          message
        }
      }
    }
  }
` 