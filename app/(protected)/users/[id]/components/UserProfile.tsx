import React from 'react';
import { Container } from '@/components/common/container';
import { Button } from '@/components/ui/button';

export default function UserProfile({ user }: { user: any }) {
  return (
    <Container>
      <div className="flex flex-col items-center">
        {/* User Image Placeholder */}
        <div className="w-24 h-24 rounded-full bg-gray-300 mb-6"></div>

        {/* User Details Form */}
        <form className="w-full max-w-lg">
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Client</label>
              <input
                type="text"
                value={user?.clientId}
                disabled
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Business Unit</label>
              <input
                type="text"
                value={user?.businessUnitId}
                disabled
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">First Name</label>
              <input
                type="text"
                value={user?.firstName}
                disabled
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Last Name</label>
              <input
                type="text"
                value={user?.lastName}
                disabled
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                value={user?.email}
                disabled
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Mobile Number</label>
              <div className="flex items-center">
                <span className="mr-2">+{user?.isdCode}</span>
                <input
                  type="text"
                  value={user?.mobileNumber}
                  disabled
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Role</label>
              <input
                type="text"
                value={user?.role}
                disabled
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Status</label>
              <input
                type="text"
                value={user?.status}
                disabled
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
          </div>

          {/* Save Changes Button */}
          <div className="mt-6">
            <Button variant="primary" className="w-full">
              Save Changes
            </Button>
          </div>
        </form>
      </div>
    </Container>
  );
}