import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { discordContactMessage } from '../../libs/discord';

const ContactForm = () => {
  const { register, handleSubmit, formState: { errors }, reset } = useForm();
  const [submissionMessage, setSubmissionMessage] = useState('');

  const onSubmit = async (data: any) => {
    try {
      const body = discordContactMessage(data);
      await fetch('/api/discord/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      setSubmissionMessage('Thank you for reaching out! We will get back to you as soon as possible.');
      reset();
    } catch (error) {
      console.error('Error sending webhook:', error);
      setSubmissionMessage('There was an error submitting your message. Please try again later.');
    }
  };

  return (
    <>
      {submissionMessage && (
        <div className="bg-green-50 p-6 rounded-md shadow-md text-center text-lg font-semibold text-green-800 mt-10 mx-auto lg:w-1/4 sm:w-1/2">
          {submissionMessage}
        </div>
      )}
      {submissionMessage === '' && (
        <form onSubmit={handleSubmit(onSubmit)} className="max-w-lg mx-auto p-4 mt-10 bg-white rounded shadow">
          <div className="mb-4">
            <label htmlFor="name" className="block text-gray-700 text-sm font-bold mb-2">Name</label>
            <input id="name" {...register('name', { required: true })} className="w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none" />
            {errors.name && <span className="text-red-500 text-xs">This field is required</span>}
          </div>

          <div className="mb-4">
            <label htmlFor="email" className="block text-gray-700 text-sm font-bold mb-2">Email</label>
            <input id="email" {...register('email')} className="w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none" />
            {errors.email && <span className="text-red-500 text-xs">This field is required</span>}
          </div>

          <div className="mb-4">
            <label htmlFor="message" className="block text-gray-700 text-sm font-bold mb-2">Message</label>
            <textarea id="message" {...register('message', { required: true })} className="w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none" rows={4}></textarea>
            {errors.message && <span className="text-red-500 text-xs">This field is required</span>}
          </div>

          <button type="submit" className="w-full px-3 py-2 text-white bg-blue-500 rounded-lg hover:bg-blue-400 focus:outline-none">Submit</button>
        </form>
      )}
    </>
  );
};

export default ContactForm;
