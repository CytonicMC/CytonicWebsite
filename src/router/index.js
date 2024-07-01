import {createRouter, createWebHistory} from 'vue-router';
import HomeView from '@/views/HomeView.vue';

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        // basic navigation
        {
            path: '/',
            name: 'home',
            component: HomeView,
        },
        {
            path: '/home',
            name: 'homepath',
            component: () => import( '@/views/HomeView.vue'),
        },
        {
            path: '/contact',
            name: 'contact',
            component: () => import( '@/views/ContactView.vue'),
        },
        {
            path: '/my-account',
            name: 'my-account',
            component: () => import( '@/views/users/UserHome.vue'),
        },
        {
            path: '/goodbye',
            name: 'goodbye',
            component: () => import( '@/views/misc/Goodbye.vue'),
        },

        // ** FORUMS ** //
        {
            path: '/forums/home',
            alias: ['/forums'],
            component: () => import('@/views/forums/FourmsLanding.vue')
        },
        {
            path: '/forums/topics/:id',
            component: () => import('@/views/forums/TopicLanding.vue')
        },
        {
            path: '/forums/threads/:id',
            component: () => import('@/views/forums/ThreadLanding.vue')
        },
        {
            path: '/forums/thread/notfound',
            component: () => import('@/views/forums/ThreadNotFound.vue')
        },

        // auth stuff
        {
            path: '/auth/login',
            name: 'login',
            alias: ['/login', '/sign-in', '/signin'],
            component: () => import( '@/views/auth/LoginPage.vue'),
        },
        {
            path: '/auth/register',
            name: 'registration',
            alias: ['/register', '/signup'],
            component: () => import( '@/views/auth/RegistrationPage.vue'),
        },
        {
            path: '/auth/password-reset',
            name: 'password-resets',
            alias: ['/password-reset', '/reset-password'],
            component: () => import( '@/views/auth/PasswordReset.vue'),
        },
        {
            path: '/auth/request-password-reset',
            name: 'registration',
            alias: ['/request-password-reset', '/reset-my-password'],
            component: () => import( '@/views/auth/RequestPasswordReset.vue'),
        },
        {
            path: '/registered',
            name: 'registrationlanding',
            component: () => import( '@/views/auth/RegistrationLanding.vue'),
        },

        // legal stuff
        {
            path: '/legal/tos',
            name: 'termsofservice',
            alias: ['/tos', '/termsofservice'],
            component: () => import( '@/views/legal/TermsOfService.vue'),
        },
        {
            path: '/legal/privacy',
            alias: ['/legal/privacy-policy', '/privacy', '/privacy-policy'],
            name: 'privacypolicy1',
            component: () => import( '@/views/legal/PrivacyPolicy.vue'),
        },

        // admin
        {
            path: '/admin/home',
            alias: ['/admin'],
            name: 'adminhome',
            component: () => import( '@/views/admin/AdminHome.vue'),
        },

        // appeals
        {
            path: '/appeals',
            name: 'appeals',
            redirect: '/forums/topics/PUNISHMENT_APPEALS',
            component: () => import( '@/views/forums/TopicLanding.vue'),
        },

        // catchall
        {
            path: '/:pathMatch(.*)*',
            name: 'NotFound',
            component: () => import('@/views/misc/NotFound.vue')
        },
    ],
});

export default router;
