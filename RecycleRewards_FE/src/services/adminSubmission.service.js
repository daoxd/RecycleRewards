
import { request } from './api.js';

export const adminSubmissionService = {
  list({ status = 'pending', page = 1, limit = 6 } = {}) {
    const params = new URLSearchParams({
      status,
      page: String(page),
      limit: String(limit),
    });

    return request(`/admin/submissions?${params.toString()}`);
  },

  approve(id) {
    return request(`/admin/submissions/${encodeURIComponent(id)}/approve`, {
      method: 'PATCH',
    });
  },

  reject(id) {
    return request(`/admin/submissions/${encodeURIComponent(id)}/reject`, {
      method: 'PATCH',
    });
  },
};
//
//  adminSubmission.service.js
//  
//
//  Created by Duy on 15/10/26.
//

