defmodule Toia.Questions do
  @moduledoc """
  The Questions context.
  """

  import Ecto.Query, warn: false
  alias Toia.Repo

  alias Toia.Questions.Question
  alias Toia.VideosQuestionsStreams.VideoQuestionStream
  alias Toia.Videos.Video
  alias Toia.Streams.Stream
  alias Toia.ToiaUsers
  alias Toia.QuestionSuggestions

  @doc """
  Returns the list of questions.

  ## Examples

      iex> list_questions()
      [%Question{}, ...]

  """
  def list_questions do
    Repo.all(Question)
  end

  @doc """
  Gets a single question.

  Raises `Ecto.NoResultsError` if the Question does not exist.

  ## Examples

      iex> get_question!(123)
      %Question{}

      iex> get_question!(456)
      ** (Ecto.NoResultsError)

  """
  def get_question!(id), do: Repo.get!(Question, id)
  def get_question(nil), do: nil
  def get_question(id), do: Repo.get(Question, id)

  @doc """
  Creates a question.

  ## Examples

      iex> create_question(%{field: value})
      {:ok, %Question{}}

      iex> create_question(%{field: bad_value})
      {:error, %Ecto.Changeset{}}

  """
  def create_question(attrs \\ %{}) do
    %Question{}
    |> Question.changeset(attrs)
    |> Repo.insert()
  end

  @doc """
  Updates a question.

  ## Examples

      iex> update_question(question, %{field: new_value})
      {:ok, %Question{}}

      iex> update_question(question, %{field: bad_value})
      {:error, %Ecto.Changeset{}}

  """
  def update_question(%Question{} = question, attrs) do
    question
    |> Question.changeset(attrs)
    |> Repo.update()
  end

  @doc """
  Deletes a question.

  ## Examples

      iex> delete_question(question)
      {:ok, %Question{}}

      iex> delete_question(question)
      {:error, %Ecto.Changeset{}}

  """
  def delete_question(%Question{} = question) do
    Repo.delete(question)
  end

  @doc """
  Returns an `%Ecto.Changeset{}` for tracking question changes.

  ## Examples

      iex> change_question(question)
      %Ecto.Changeset{data: %Question{}}

  """
  def change_question(%Question{} = question, attrs \\ %{}) do
    Question.changeset(question, attrs)
  end

  @doc """
  Checks if a question exists in the database.
  """
  def exists(question) do
    query =
      from(q in Question,
        where: q.question == ^question.question
      )

    Repo.exists?(query)
  end

  @doc """
  Get by question
  """
  def get_by_question(question) do
    query =
      from(q in Question,
        where: q.question == ^question,
        select: q
      )

    Repo.one(query)
  end

  @doc """
  Returns recorded questions
  """
  def get_answered_question(user_id, streamid) do
    privacy = ToiaUsers.owns_stream(user_id, streamid)

    if privacy do
      query =
        from(q in Question,
          join: vqs in VideoQuestionStream,
          on: q.id == vqs.id_question,
          join: v in Video,
          on: vqs.id_video == v.id_video,
          join: s in Stream,
          on: s.id_stream == vqs.id_stream,
          where: s.id_stream == ^streamid,
          select: %{
            id: q.id,
            question: q.question,
            suggested_type: q.suggested_type,
            onboarding: q.onboarding,
            priority: q.priority,
            trigger_suggester: q.trigger_suggester,
            type: vqs.type,
            id_video: v.id_video
          }
        )

      Repo.all(query)
    else
      query =
        from(q in Question,
          join: vqs in VideoQuestionStream,
          on: q.id == vqs.id_question,
          join: v in Video,
          on: vqs.id_video == v.id_video,
          join: s in Stream,
          on: s.id_stream == vqs.id_stream,
          where: v.private == false,
          where: s.private == false,
          where: s.id_stream == ^streamid,
          select: %{
            id: q.id,
            question: q.question,
            suggested_type: q.suggested_type,
            onboarding: q.onboarding,
            priority: q.priority,
            trigger_suggester: q.trigger_suggester,
            type: vqs.type,
            id_video: v.id_video
          }
        )

      Repo.all(query)
    end
  end

  def get_answered_question(user_id) do
    query =
      from(q in Question,
        join: vqs in VideoQuestionStream,
        on: q.id == vqs.id_question,
        join: v in Video,
        on: vqs.id_video == v.id_video,
        where: v.toia_id == ^user_id,
        select: %{
          id: q.id,
          question: q.question,
          suggested_type: q.suggested_type,
          onboarding: q.onboarding,
          priority: q.priority,
          trigger_suggester: q.trigger_suggester,
          type: vqs.type,
          id_video: v.id_video
        }
      )

    Repo.all(query)
  end

  @doc """
  Process new questions.
  If the id is -1, add new.
  If the id is valid but the question is different, add new. Don't touch the old one.
  """
  def pre_process_new_questions(questions, type) do
    {:ok,
     Enum.map(questions, fn question ->
       process_new_question_individual(question, type)
     end)}
  end

  defp process_new_question_individual(%{question: q, id_question: id}, type) do
    case get_question(id) do
      nil ->
        {:ok, question} =
          create_question(%{
            question: q,
            suggested_type: type,
            onboarding: false,
            priority: 100,
            trigger_suggester: true
          })

        question

      question when question.question == q ->
        question

      _ ->
        {:ok, question} =
          create_question(%{
            question: q,
            suggested_type: type,
            onboarding: false,
            priority: 100,
            trigger_suggester: true
          })

        question
    end
  end

  defp process_new_question_individual(%{question: q}, type) do
    {:ok, question} =
      create_question(%{
        question: q,
        suggested_type: type,
        onboarding: false,
        priority: 100,
        trigger_suggester: true
      })

    question
  end

  @doc """
  Post process new questions.
  If it's a suggested question, mark it as not pending
  """
  def post_process_new_questions(questions, user_id) do
    {:ok,
     Enum.map(questions, fn question ->
       suggestion = QuestionSuggestions.get_question_suggestion(question.id, user_id)

       if suggestion != nil do
         {:ok, qs} =
           QuestionSuggestions.update_question_suggestion(suggestion, %{isPending: false})

         qs
       else
         question
       end
     end)}
  end
end
