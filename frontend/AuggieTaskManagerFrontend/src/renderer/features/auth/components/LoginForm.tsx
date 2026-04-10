import { LoginData } from '../../../types/user';
import { Link } from 'react-router-dom';

/**
 * Props that LoginForm component receives from its parent (Login.tsx)
 * These props allow the parent to control the form's behavior
 */
type LoginFormProps = {
  formData: LoginData; // Current values of username/email and password fields
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void; // Function to call when user types
  handleSubmit: (e: React.SubmitEvent) => void; // Function to call when form is submitted
};

/**
 * LoginForm Component - The Visual Login Form
 *
 * This component renders the actual login form UI (inputs, button, link).
 * It doesn't contain any logic - it just displays what the parent tells it to display.
 *
 * The form uses DaisyUI classes for styling (input, btn, fieldset, etc.)
 * and follows the same pattern as SignUpForm for consistency.
 */
export const LoginForm = ({
  formData,
  handleChange,
  handleSubmit,
}: LoginFormProps) => {
  return (
    // Form container with DaisyUI styling - creates a bordered box with background
    <form
      className="grid grid-cols-1 gap-4 fieldset bg-base-200 border-base-300 rounded-box border p-4 max-w-md"
      onSubmit={(e) => handleSubmit(e as React.SubmitEvent)}
    >
      {/* Username/Email input field */}
      <label className="fieldset">
        <span className="label">Username or Email</span>
        <input
          name="identifier" // This matches the property name in LoginData type
          value={formData.identifier} // Controlled input - value comes from parent state
          onChange={handleChange} // Calls parent's handleChange when user types
          type="text"
          className="input input-primary validator" // DaisyUI classes for styling
          placeholder="Username or Email"
          required // Browser validation - field must be filled
        />
      </label>

      {/* Password input field */}
      <label className="fieldset">
        <span className="label">Password</span>
        <input
          name="password" // This matches the property name in LoginData type
          value={formData.password} // Controlled input - value comes from parent state
          onChange={handleChange} // Calls parent's handleChange when user types
          type="password" // Hides password characters
          className="input input-primary validator" // DaisyUI classes for styling
          placeholder="Password"
          required // Browser validation - field must be filled
        />
      </label>

      {/* Submit button */}
      <button className="btn btn-neutral mt-4" type="submit">
        Log In
      </button>

      {/* Link to sign up page */}
      <p className="text-center text-sm mt-2">
        Don't have an account?{' '}
        <Link
          to="/signup"
          className="text-primary font-semibold hover:underline"
        >
          Sign Up
        </Link>
      </p>
    </form>
  );
};
