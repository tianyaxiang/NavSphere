export class ResourceService {
  async addResource(resource: { path: string }) {
    // Logic to add the resource, e.g., sending a request to your API
    const response = await fetch('/api/resource', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(resource),
    });

    if (!response.ok) {
      throw new Error('Failed to add resource');
    }

    return await response.json(); // Return the response data if needed
  }
} 
