import { createBrowserRouter } from 'react-router-dom'
import MainLayout from '../layouts/MainLayout'
import ErrorPage from '../pages/ErrorPage'
import {
  AdminDashboard,
  AdminGenres,
  AdminInstitutions,
  AdminReports,
  AdminUsers,
  BookDetails,
  BookForm,
  Catalog,
  CreatePost,
  DonationFlow,
  DonationsHistory,
  ForgotPassword,
  Home,
  Institutions,
  Login,
  NotFound,
  Notifications,
  Profile,
  ProfileEdit,
  PublicProfile,
  Register,
  ResetPassword,
  SocialFeed,
  TradeChat,
  TradeDetails,
  TradeProposal,
  TradeReview,
  TradesHistory,
} from './pages'
import { withSuspense } from './withSuspense'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    errorElement: <ErrorPage />,
    children: [
      {
        index: true,
        element: withSuspense(Home),
      },
      {
        path: 'catalog',
        element: withSuspense(Catalog),
      },
      {
        path: 'books/:bookId',
        element: withSuspense(BookDetails),
      },
      {
        path: 'books/new',
        element: withSuspense(BookForm),
      },
      {
        path: 'books/:bookId/edit',
        element: withSuspense(BookForm),
      },
      {
        path: 'books/:bookId/trade',
        element: withSuspense(TradeProposal),
      },
      {
        path: 'notifications',
        element: withSuspense(Notifications),
      },
      {
        path: 'trades',
        element: withSuspense(TradesHistory),
      },
      {
        path: 'trades/:tradeId',
        element: withSuspense(TradeDetails),
      },
      {
        path: 'trades/:tradeId/chat',
        element: withSuspense(TradeChat),
      },
      {
        path: 'trades/:tradeId/review',
        element: withSuspense(TradeReview),
      },
      {
        path: 'feed',
        element: withSuspense(SocialFeed),
      },
      {
        path: 'posts/new',
        element: withSuspense(CreatePost),
      },
      {
        path: 'institutions',
        element: withSuspense(Institutions),
      },
      {
        path: 'institutions/:institutionId/donate',
        element: withSuspense(DonationFlow),
      },
      {
        path: 'donations',
        element: withSuspense(DonationsHistory),
      },
      {
        path: 'users/:userId',
        element: withSuspense(PublicProfile),
      },
      {
        path: 'profile',
        element: withSuspense(Profile),
      },
      {
        path: 'profile/edit',
        element: withSuspense(ProfileEdit),
      },
      {
        path: 'admin',
        element: withSuspense(AdminDashboard),
      },
      {
        path: 'admin/institutions',
        element: withSuspense(AdminInstitutions),
      },
      {
        path: 'admin/reports',
        element: withSuspense(AdminReports),
      },
      {
        path: 'admin/users',
        element: withSuspense(AdminUsers),
      },
      {
        path: 'admin/genres',
        element: withSuspense(AdminGenres),
      },
    ],
  },
  {
    path: '/login',
    element: withSuspense(Login),
  },
  {
    path: '/register',
    element: withSuspense(Register),
  },
  {
    path: '/forgot-password',
    element: withSuspense(ForgotPassword),
  },
  {
    path: '/reset-password',
    element: withSuspense(ResetPassword),
  },
  {
    path: '*',
    element: withSuspense(NotFound),
  },
])
