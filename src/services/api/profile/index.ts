import { mainApi } from '..';
import { IUserProfile } from './types';

const profileApi = mainApi.injectEndpoints({
  endpoints: (builder) => ({
    getProfile: builder.query<IUserProfile, void>({
      query: () => ({
        url: `/auth/profile`,
        method: 'GET',
      }),
      providesTags: ['Profile'],
    }),
    updateProfile: builder.mutation<IUserProfile, IUserProfile>({
      query: (data) => ({
        url: '/auth/profile',
        method: 'PUT',
        data,
      }),
      invalidatesTags: ['Profile'],
    }),
  }),
});

export const { useGetProfileQuery, useUpdateProfileMutation } = profileApi;
