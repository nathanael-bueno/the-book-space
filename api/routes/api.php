<?php

use App\Http\Controllers\AdminGenreController;
use App\Http\Controllers\AdminStatsController;
use App\Http\Controllers\AdminInstitutionController;
use App\Http\Controllers\AdminReportController;
use App\Http\Controllers\AdminUserController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\BookController;
use App\Http\Controllers\DonationController;
use App\Http\Controllers\EmailVerificationController;
use App\Http\Controllers\GenreController;
use App\Http\Controllers\GoogleAuthController;
use App\Http\Controllers\ImageUploadController;
use App\Http\Controllers\InstitutionController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\NotificationPreferenceController;
use App\Http\Controllers\PasswordResetController;
use App\Http\Controllers\PostCommentController;
use App\Http\Controllers\PostController;
use App\Http\Controllers\PostLikeController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\ReviewController;
use App\Http\Controllers\TradeController;
use App\Http\Controllers\TradeMessageController;
use App\Http\Controllers\UserFavoriteGenreController;
use Illuminate\Support\Facades\Route;

// --- Public routes ---
Route::post('/register', [AuthController::class, 'register'])->middleware('throttle:8,1');
Route::post('/login/start', [AuthController::class, 'loginStart'])->middleware('throttle:10,1');
Route::post('/login', [AuthController::class, 'login'])->middleware('throttle:10,1');
Route::post('/login/code', [AuthController::class, 'loginWithCode'])->middleware('throttle:10,1');
Route::post('/refresh', [AuthController::class, 'refresh'])->middleware('throttle:30,1');
Route::post('/forgot-password', [PasswordResetController::class, 'forgot'])->middleware('throttle:6,1');
Route::post('/reset-password', [PasswordResetController::class, 'reset'])->middleware('throttle:10,1');
Route::post('/email/verify', [EmailVerificationController::class, 'verify'])->middleware('throttle:10,1');
Route::post('/email/resend', [EmailVerificationController::class, 'resend'])->middleware('throttle:4,1');
Route::get('/auth/google', [GoogleAuthController::class, 'redirect'])->middleware('throttle:20,1');
Route::get('/auth/google/callback', [GoogleAuthController::class, 'callback'])->middleware('throttle:20,1');
Route::get('/users/{user}', [ProfileController::class, 'showPublic']);
Route::get('/users/{user}/reviews', [ReviewController::class, 'byUser']);
Route::get('/books', [BookController::class, 'index']);
Route::get('/books/{book}', [BookController::class, 'show']);
Route::get('/genres', [GenreController::class, 'index']);          // public read
Route::get('/institutions', [InstitutionController::class, 'index']);
Route::get('/institutions/{institution}', [InstitutionController::class, 'show']);

// --- Broadcast auth (JWT) ---
Route::post('/broadcasting/auth', function () {
    return \Illuminate\Support\Facades\Broadcast::auth(request());
})->middleware(['auth.jwt']);

// --- Authenticated routes ---
Route::middleware(['auth.jwt', 'active.user', 'token.fresh', 'verified.email'])->group(function () {
    Route::get('/me', [AuthController::class, 'me']);
    Route::get('/me/profile', [ProfileController::class, 'me']);
    Route::patch('/me/profile', [ProfileController::class, 'update']);
    Route::get('/me/favorite-genres', [UserFavoriteGenreController::class, 'index']);
    Route::put('/me/favorite-genres', [UserFavoriteGenreController::class, 'store']);
    Route::get('/me/books', [BookController::class, 'myBooks']);

    // Notification preferences
    Route::get('/me/notification-preferences', [NotificationPreferenceController::class, 'show']);
    Route::patch('/me/notification-preferences', [NotificationPreferenceController::class, 'update']);

    // Books (write/read auth)
    Route::get('/books/recommended', [BookController::class, 'recommended']);
    Route::post('/books', [BookController::class, 'store']);
    Route::patch('/books/{book}', [BookController::class, 'update']);
    Route::delete('/books/{book}', [BookController::class, 'destroy']);

    // Trades
    Route::get('/trades', [TradeController::class, 'index']);
    Route::get('/trades/{trade}', [TradeController::class, 'show']);
    Route::post('/trades', [TradeController::class, 'store']);
    Route::patch('/trades/{trade}/status', [TradeController::class, 'updateStatus']);
    Route::patch('/trades/{trade}/intermediacao', [TradeController::class, 'updateIntermediation']);
    Route::get('/trades/{trade}/messages', [TradeMessageController::class, 'index']);
    Route::post('/trades/{trade}/messages', [TradeMessageController::class, 'store']);
    Route::post('/trades/{trade}/reviews', [ReviewController::class, 'store']);
    Route::post('/reviews/{review}/report', [ReviewController::class, 'report']);

    // Notifications
    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::patch('/notifications/{notification}/read', [NotificationController::class, 'markAsRead']);

    // Posts (social feed)
    Route::get('/posts', [PostController::class, 'index']);
    Route::get('/posts/{post}', [PostController::class, 'show']);
    Route::post('/posts', [PostController::class, 'store']);
    Route::patch('/posts/{post}', [PostController::class, 'update']);
    Route::delete('/posts/{post}', [PostController::class, 'destroy']);
    Route::post('/posts/{post}/report', [PostController::class, 'report']);
    Route::post('/posts/{post}/likes', [PostLikeController::class, 'store']);
    Route::delete('/posts/{post}/likes', [PostLikeController::class, 'destroy']);
    Route::get('/posts/{post}/comments', [PostCommentController::class, 'index']);
    Route::post('/posts/{post}/comments', [PostCommentController::class, 'store']);

    // Reports (user-facing: create a report on a post or review)
    Route::post('/reports', [ReportController::class, 'store'])->middleware('throttle:10,1');

    // Donations
    Route::get('/donations', [DonationController::class, 'index']);
    Route::post('/donations', [DonationController::class, 'store']);

    // Image upload (Cloudflare R2)
    Route::post('/upload', [ImageUploadController::class, 'upload'])->middleware('throttle:20,1');
});

// --- Admin-only routes ---
Route::middleware(['auth.jwt', 'active.user', 'token.fresh', 'verified.email', 'role.admin'])->group(function () {
    // Stats
    Route::get('/admin/stats', [AdminStatsController::class, 'index']);

    // Users (management)
    Route::get('/admin/users', [AdminUserController::class, 'index']);
    Route::post('/admin/users', [AdminUserController::class, 'store']);
    Route::get('/admin/users/organized', [AdminUserController::class, 'organized']);
    Route::patch('/admin/users/{user}/status', [AdminUserController::class, 'updateStatus']);

    // Institutions (CRUD)
    Route::get('/admin/institutions', [AdminInstitutionController::class, 'index']);
    Route::post('/admin/institutions', [AdminInstitutionController::class, 'store']);
    Route::patch('/admin/institutions/{institution}', [AdminInstitutionController::class, 'update']);
    Route::delete('/admin/institutions/{institution}', [AdminInstitutionController::class, 'destroy']);

    // Reports (list + moderate)
    Route::get('/admin/reports', [AdminReportController::class, 'index']);
    Route::patch('/admin/reports/{report}/status', [AdminReportController::class, 'updateStatus']);
    Route::get('/admin/reports/donations-by-institution', [AdminStatsController::class, 'donationsByInstitution']);

    // Genres (admin CRUD — extends the public read-only endpoint)
    Route::post('/admin/genres', [AdminGenreController::class, 'store']);
    Route::patch('/admin/genres/{genre}', [AdminGenreController::class, 'update']);
    Route::delete('/admin/genres/{genre}', [AdminGenreController::class, 'destroy']);
    Route::get('/admin/genres', [AdminGenreController::class, 'index']);
});
