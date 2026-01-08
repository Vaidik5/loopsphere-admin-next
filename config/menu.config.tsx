import {

  File as DocumentIcon,
  
  LayoutGrid,
 
  Users as PeopleIcon,
 
  Shield,
  ShieldUser,
  
  Briefcase as WorIcon,

} from 'lucide-react';
import { type MenuConfig } from './types';

export const MENU_SIDEBAR: MenuConfig = [
  {
    title: 'Dashboards',
    icon: LayoutGrid,
    path: '/',
  },
  {
    title: 'Users',
    path: '/users',
    icon: ShieldUser,
    
  },
  
 

 ];

export const MENU_SIDEBAR_CUSTOM: MenuConfig = [
  {
    title: 'Dashboards',
    icon: LayoutGrid,
    path: '/',
  },
  {
    title: 'Authentication',
    icon: Shield,
    children: [
      {
        title: 'Sign In',
        path: '/signin',
      },
 
      {
        title: 'Verify Email',
        path: '/verify-email',
      },
      {
        title: 'Reset Password',
        path: '/reset-password',
      },
   
      { title: 'Account Deactivated', path: '/auth/account-deactivated' },
      
    ],
  },
 
];

export const MENU_SIDEBAR_COMPACT: MenuConfig = [
   {
    title: 'Dashboards',
    icon: LayoutGrid,
    path: '/',
  },
  {
    title: 'Authentication',
    icon: Shield,
    children: [
      {
        title: 'Sign In',
        path: '/signin',
      },
    
      {
        title: 'Verify Email',
        path: '/verify-email',
      },
      {
        title: 'Reset Password',
        path: '/reset-password',
      },
   
      { title: 'Account Deactivated', path: '/auth/account-deactivated' },
      { title: 'Error 404', path: '/error/404' },
      { title: 'Error 500', path: '/error/500' },
    ],
  },
 
  {
    title: 'User Management',
    icon: ShieldUser,
    children: [
      {
        title: 'Users',
        path: '/user-management/users',
      },
     
    ],
  },
];

export const MENU_MEGA: MenuConfig = [
  { title: 'Home', path: '/' },
   
];

export const MENU_MEGA_MOBILE: MenuConfig = [
  { title: 'Home', path: '/' },
 
];

export const MENU_HELP: MenuConfig = [

];
