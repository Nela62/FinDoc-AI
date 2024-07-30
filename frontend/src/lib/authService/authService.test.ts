// import { createClient } from '@/lib/supabase/server';
// import { serviceClient } from '@/lib/supabase/service';
// import {
//   registerWithOtp,
//   signInWithOtp,
//   signInWithPassword,
//   verifyOtp,
// } from './authService';

// jest.mock('@/lib/supabase/server');
// jest.mock('./supabase/service');
// jest.mock('next-axiom');

// describe('Authentication Functions', () => {
//   let mockSupabaseAuth: any;
//   let mockServiceClient: any;

//   beforeEach(() => {
//     mockSupabaseAuth = {
//       signInWithPassword: jest.fn(),
//       signInWithOtp: jest.fn(),
//       verifyOtp: jest.fn(),
//       getUser: jest.fn(),
//     };

//     mockServiceClient = {
//       from: jest.fn().mockReturnThis(),
//       select: jest.fn().mockReturnThis(),
//       eq: jest.fn().mockReturnThis(),
//       single: jest.fn(),
//       insert: jest.fn(),
//     };

//     (createClient as jest.Mock).mockReturnValue({ auth: mockSupabaseAuth });
//     (serviceClient as jest.Mock).mockReturnValue(mockServiceClient);
//   });

//   describe('signInWithPassword', () => {
//     it('should sign in successfully', async () => {
//       mockSupabaseAuth.signInWithPassword.mockResolvedValue({ error: null });
//       const result = await signInWithPassword('test@example.com', 'password');
//       expect(result.error).toBeNull();
//     });

//     it('should handle invalid credentials', async () => {
//       mockSupabaseAuth.signInWithPassword.mockResolvedValue({
//         error: { status: 400 },
//       });
//       const result = await signInWithPassword(
//         'test@example.com',
//         'wrong_password',
//       );
//       expect(result.error).toBe('Invalid credentials');
//     });

//     // Add more test cases for different error scenarios
//   });

//   describe('signInWithOtp', () => {
//     it('should initiate OTP sign in successfully', async () => {
//       mockSupabaseAuth.signInWithOtp.mockResolvedValue({ error: null });
//       const result = await signInWithOtp('test@example.com');
//       expect(result.error).toBeNull();
//     });

//     // Add more test cases for different scenarios
//   });

//   describe('registerWithOtp', () => {
//     it('should register a new user successfully', async () => {
//       mockServiceClient.single.mockResolvedValue({ data: null });
//       mockSupabaseAuth.signInWithOtp.mockResolvedValue({ error: null });
//       const result = await registerWithOtp('new@example.com');
//       expect(result.error).toBeNull();
//     });

//     it('should handle existing email', async () => {
//       mockServiceClient.single.mockResolvedValue({
//         data: { email: 'existing@example.com' },
//       });
//       const result = await registerWithOtp('existing@example.com');
//       expect(result.error).toBe(
//         'This email is already taken. Please login instead.',
//       );
//     });

//     // Add more test cases for different scenarios
//   });

//   describe('verifyOtp', () => {
//     it('should verify OTP successfully', async () => {
//       mockSupabaseAuth.verifyOtp.mockResolvedValue({ error: null });
//       mockSupabaseAuth.getUser.mockResolvedValue({
//         data: { user: { id: 'user_id' } },
//         error: null,
//       });
//       mockServiceClient.insert.mockResolvedValue({ error: null });
//       const result = await verifyOtp(
//         'test@example.com',
//         'valid_token',
//         'John Doe',
//       );
//       expect(result.error).toBeNull();
//     });

//     // Add more test cases for different scenarios
//   });
// });
