import { SignupData } from '../../../types/user';

type SignUpFormProps = {
  formData: SignupData;
  handleChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => void;
  handleSubmit: (e: React.SubmitEvent) => void;
};

export const SignUpForm = ({
  formData,
  handleChange,
  handleSubmit,
}: SignUpFormProps) => {
  return (
    <form
      className="grid grid-cols-2 gap-4 fieldset bg-base-200 border-base-300 rounded-box border p-4 max-w-2xl"
      onSubmit={(e) => handleSubmit(e as React.SubmitEvent)}
    >
      <label className="fieldset">
        <span className="label">First Name</span>
        <input
          name="firstname"
          value={formData.firstname}
          onChange={handleChange}
          type="text"
          className="input input-primary validator"
          placeholder="First Name"
          required
        />
      </label>

      <label className="fieldset">
        <span className="label">Last Name</span>
        <input
          name="lastname"
          value={formData.lastname}
          onChange={handleChange}
          type="text"
          className="input input-primary validator"
          placeholder="Last Name"
          required
        />
      </label>
      <label className="fieldset">
        <span className="label">Username</span>
        <input
          name="username"
          value={formData.username}
          onChange={handleChange}
          type="text"
          className="input input-primary validator"
          placeholder="Username"
          required
        />
      </label>
      <label className="fieldset">
        <span className="label">Email</span>
        <input
          name="email"
          value={formData.email}
          onChange={handleChange}
          type="email"
          className="input input-primary validator"
          placeholder="Email"
          required
        />
      </label>
      <label className="fieldset">
        <span className="label">Password</span>
        <input
          name="password"
          value={formData.password}
          onChange={handleChange}
          type="password"
          className="input input-primary validator"
          placeholder="Password"
          required
        />
      </label>
      <label className="fieldset">
        <span className="label">School Year</span>
        <select
          name="schoolyear"
          value={formData.schoolyear ?? ''}
          onChange={handleChange}
          className="select select-primary validator"
          required
        >
          <option value="">Select year</option>
          <option value="Freshman">Freshman</option>
          <option value="Sophomore">Sophomore</option>
          <option value="Junior">Junior</option>
          <option value="Senior">Senior</option>
          <option value="Graduate">Graduate</option>
        </select>
      </label>
      <label className="fieldset">
        <span className="label">Major</span>
        <select
          name="major"
          value={formData.major}
          onChange={handleChange}
          className="select select-primary validator"
          required
        >
          <option value="">Select a major</option>
          <option value="CS">Computer Science</option>
          <option value="CpE">Computer Engineering</option>
          <option value="EE">Electrical Engineering</option>
          <option value="ME">Mechanical Engineering</option>
          <option value="CE">Civil Engineering</option>
          <option value="BIO">Biology</option>
          <option value="CHEM">Chemistry</option>
          <option value="BUS">Business Administration</option>
          <option value="PSY">Psychology</option>
          <option value="NURS">Nursing</option>
          <option value="OTHER">Other</option>
        </select>
      </label>
      <label className="fieldset">
        <span className="label">Minor</span>
        <select
          name="minor"
          value={formData.minor}
          onChange={handleChange}
          className="select select-primary validator"
        >
          <option value="">Select a minor</option>
          <option value="CS">Computer Science</option>
          <option value="CpE">Computer Engineering</option>
          <option value="EE">Electrical Engineering</option>
          <option value="ME">Mechanical Engineering</option>
          <option value="CE">Civil Engineering</option>
          <option value="BIO">Biology</option>
          <option value="CHEM">Chemistry</option>
          <option value="BUS">Business Administration</option>
          <option value="PSY">Psychology</option>
          <option value="NURS">Nursing</option>
          <option value="OTHER">Other</option>
        </select>
      </label>
      <button className="btn btn-neutral mt-4 col-span-2" type="submit">
        Sign Up
      </button>
    </form>
  );
};
