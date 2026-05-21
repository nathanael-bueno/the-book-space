import { Navigate, createBrowserRouter } from 'react-router-dom'
import MainLayout from '../layouts/MainLayout'
import ErrorPage from '../pages/ErrorPage'
import {
  AdminInstitutions,
  BookDetails,
  BookForm,
  Catalog,
  CompleteProfile,
  CreatePost,
  EditPost,
  DonationFlow,
  ForgotPassword,
  GoogleAuthCallback,
  Institutions,
  Login,
  NotFound,
  Notifications,
  Profile,
  ProfileEdit,
  PublicProfile,
  Register,
  ResetPassword,
  Settings,
  SocialFeed,
  TradeChat,
  TradeDetails,
  TradeProposal,
  TradeReview,
  TradesHistory,
  VerifyEmail,
} from './pages'
import { withSuspense } from './withSuspense'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/auth/login" replace />,
  },
  {
    path: '/app',
    element: <MainLayout />,
    errorElement: <ErrorPage />,
    children: [
      {
        index: true,
        element: <Navigate to="feed" replace />,
      },
      {
        path: 'home',
        element: <Navigate to="/app/feed" replace />,
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
        path: 'posts/:postId/edit',
        element: withSuspense(EditPost),
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
        path: 'settings',
        element: withSuspense(Settings),
      },
      {
        path: 'admin',
        element: <Navigate to="/app/admin/institutions" replace />,
      },
      {
        path: 'admin/institutions',
        element: withSuspense(AdminInstitutions),
      },
    ],
  },
  {
    path: '/auth/login',
    element: withSuspense(Login),
  },
  {
    path: '/auth/google/callback',
    element: withSuspense(GoogleAuthCallback),
  },
  {
    path: '/auth/complete-profile',
    element: withSuspense(CompleteProfile),
  },
  {
    path: '/auth/register',
    element: withSuspense(Register),
  },
  {
    path: '/auth/verify-email',
    element: withSuspense(VerifyEmail),
  },
  {
    path: '/auth/forgot-password',
    element: withSuspense(ForgotPassword),
  },
  {
    path: '/auth/reset-password',
    element: withSuspense(ResetPassword),
  },
  {
    path: '*',
    element: withSuspense(NotFound),
  },
])
