import React from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { supabase } from '../supabase';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../Auth/AuthContext';

type PollForm = {
  question: string;
  options: { value: string }[];
  allowMultiple: boolean;
  showResultsBeforeVoting: boolean;
  ends_at?: string;
};

type CreatePollProps = {
  onPollCreated?: () => void;
};

const CreatePoll = ({ onPollCreated }: CreatePollProps) => {
  const {
    control,
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<PollForm>({
    defaultValues: {
      options: [{ value: '' }, { value: '' }],
      allowMultiple: false,
      showResultsBeforeVoting: true
    }
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'options' });
  const navigate = useNavigate();
  const session = useAuth();

  const onSubmit = async (data: PollForm) => {
    if (data.options.length < 2) return toast.error('At least 2 options required');

    const options = data.options.map(opt => opt.value).filter(Boolean);
    const { error } = await supabase.from('polls').insert({
      question: data.question,
      options,
      settings: {
        allowMultiple: data.allowMultiple,
        showResultsBeforeVoting: data.showResultsBeforeVoting
      },
      created_by: session?.user?.id,
      ends_at: data.ends_at || null
    });

    if (error) {
      toast.error('Failed to create poll');
    } else {
      toast.success('Poll created!');
      onPollCreated?.();
      navigate('/dashboard');
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-0 bg-white rounded-lg p-8 space-y-6">
      <h1 className="text-3xl font-bold text-purple-700">🗳️ Create a New Poll</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

        {/* Poll Question */}
        <div>
          <input
            {...register('question', { required: true })}
            placeholder="What's your poll question?"
            className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-400"
          />
          {errors.question && (
            <p className="text-red-500 text-sm mt-1">⚠️ Question is required</p>
          )}
        </div>

        {/* Options List */}
        <div className="space-y-3">
          <label className="font-medium text-gray-700">Options (2-10):</label>
          {fields.map((field, index) => (
            <div key={field.id} className="flex gap-2">
              <input
                {...register(`options.${index}.value` as const, { required: true })}
                placeholder={`Option ${index + 1}`}
                className="flex-1 px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-300"
              />
              {fields.length > 2 && (
                <button
                  type="button"
                  onClick={() => remove(index)}
                  className="text-red-500 hover:text-red-600 text-xl"
                  title="Remove option"
                >
                  ✕
                </button>
              )}
            </div>
          ))}
          {fields.length < 10 && (
            <button
              type="button"
              onClick={() => append({ value: '' })}
              className="text-purple-600 hover:text-purple-800 text-sm"
            >
              + Add another option
            </button>
          )}
        </div>

        {/* Settings */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" {...register('allowMultiple')} className="accent-purple-600" />
            Allow multiple selections
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" {...register('showResultsBeforeVoting')} className="accent-purple-600" />
            Show results before voting
          </label>
        </div>

        {/* End Date Picker */}
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">
            Poll Expiration (optional):
          </label>
          <input
            type="datetime-local"
            {...register('ends_at')}
            className="w-full border px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-300"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full py-3 bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-semibold rounded-lg hover:from-purple-600 hover:to-indigo-600 transition"
        >
          🚀 Create Poll
        </button>
      </form>
    </div>
  );
};

export default CreatePoll;
