defmodule Toia.QuestionSuggestions do
  @moduledoc """
  The QuestionSuggestions context.
  """

  import Ecto.Query, warn: false
  alias Toia.Repo

  alias Toia.VideosQuestionsStreams
  alias Toia.Questions

  alias Toia.QuestionSuggestions.QuestionSuggestion
  alias Toia.Questions.Question

  @doc """
  Returns the list of question_suggestions.

  ## Examples

      iex> list_question_suggestions()
      [%QuestionSuggestion{}, ...]

  """
  def list_question_suggestions(user_id, limit) do
    query =
      from qs in QuestionSuggestion,
        join: q in Question,
        on: qs.id_question == q.id,
        where: qs.toia_id == ^user_id and qs.isPending == true

    query =
      from [qs, q] in query,
        select: %{
          id_question: qs.id_question,
          question: q.question,
          type: q.suggested_type,
          priority: q.priority,
          isPending: qs.isPending
        },
        order_by: [desc: q.priority],
        limit: ^limit

    Repo.all(query)
  end

  def list_question_suggestions(user_id) do
    query =
      from qs in QuestionSuggestion,
        join: q in Question,
        on: qs.id_question == q.id,
        where: qs.toia_id == ^user_id and qs.isPending == true

    query =
      from [qs, q] in query,
        select: %{
          id_question: qs.id_question,
          question: q.question,
          type: q.suggested_type,
          priority: q.priority,
          isPending: qs.isPending
        },
        order_by: [desc: q.priority]

    Repo.all(query)
  end

  @doc """
  Gets a single question_suggestion.

  Raises `Ecto.NoResultsError` if the Question suggestion does not exist.

  ## Examples

      iex> get_question_suggestion!(123)
      %QuestionSuggestion{}

      iex> get_question_suggestion!(456)
      ** (Ecto.NoResultsError)

  """
  def get_question_suggestion!(id), do: Repo.get!(QuestionSuggestion, id)

  @doc """
  Creates a question_suggestion.

  ## Examples

      iex> create_question_suggestion(%{field: value})
      {:ok, %QuestionSuggestion{}}

      iex> create_question_suggestion(%{field: bad_value})
      {:error, %Ecto.Changeset{}}

  """
  def create_question_suggestion(attrs) do
    case Questions.get_by_question(attrs.question) do
      %Question{} = question ->
        case VideosQuestionsStreams.has_recorded(attrs.toia_id, question.id) or
               suggestion_exists(attrs.toia_id, question.id) do
          true ->
            {:ok,
             %{
               id_question: question.id,
               question: question.question,
               type: question.suggested_type,
               priority: question.priority
             }}

          false ->
            newAttrs = %{id_question: question.id, toia_id: attrs.toia_id, isPending: true}

            insertResult =
              %QuestionSuggestion{} |> QuestionSuggestion.changeset(newAttrs) |> Repo.insert()

            case insertResult do
              {:ok, result} ->
                {:ok,
                 %{
                   id_question: result.id_question,
                   question: question.question,
                   type: question.suggested_type,
                   priority: question.priority
                 }}

              {:error, _} ->
                insertResult
            end
        end

      nil ->
        {:ok, newQuestion} = Questions.create_question(%{question: attrs.question})
        newAttrs = %{id_question: newQuestion.id, toia_id: attrs.toia_id, isPending: true}

        insertResult =
          %QuestionSuggestion{} |> QuestionSuggestion.changeset(newAttrs) |> Repo.insert()

        case insertResult do
          {:ok, result} ->
            {:ok,
             %{
               id_question: result.id_question,
               question: newQuestion.question,
               type: newQuestion.suggested_type,
               priority: newQuestion.priority
             }}

          {:error, _} ->
            insertResult
        end
    end
  end

  @doc """
  Updates a suggestion.
  """
  def update_suggestion(%QuestionSuggestion{} = old_suggestion, new_question) do
    suggestion =
      Repo.get_by!(QuestionSuggestion,
        id_question: old_suggestion.id_question,
        toia_id: old_suggestion.toia_id
      )

    question = Repo.get_by!(Question, id: old_suggestion.id_question)

    if question.question == new_question do
      {:ok,
       %{
         id_question: question.id,
         question: question.question,
         type: question.suggested_type,
         priority: question.priority
       }}
    else
      allSuggestions =
        Repo.all(from qs in QuestionSuggestion, where: qs.id_question == ^question.id)

      if length(allSuggestions) == 1 do
        Questions.update_question(question, %{question: new_question})

        {:ok,
         %{
           id_question: question.id,
           question: new_question,
           type: question.suggested_type,
           priority: question.priority
         }}
      else
        # Duplicate question
        new_q_attr = Map.delete(question, :id)
        new_q_attr = Map.delete(new_q_attr, :__struct__)
        new_q_attr = Map.delete(new_q_attr, :__meta__)
        new_q_attr = Map.put(new_q_attr, :question, new_question)
        {:ok, new_q} = Questions.create_question(new_q_attr)

        # Update old suggestion
        update_question_suggestion(suggestion, %{id_question: new_q.id})

        {:ok,
         %{
           id_question: new_q.id,
           question: new_q.question,
           type: new_q.suggested_type,
           priority: new_q.priority
         }}
      end
    end
  end

  @doc """
  Updates a question_suggestion.

  ## Examples

      iex> update_question_suggestion(question_suggestion, %{field: new_value})
      {:ok, %QuestionSuggestion{}}

      iex> update_question_suggestion(question_suggestion, %{field: bad_value})
      {:error, %Ecto.Changeset{}}

  """
  def update_question_suggestion(%QuestionSuggestion{} = question_suggestion, attrs) do
    question_suggestion
    |> QuestionSuggestion.changeset(attrs)
    |> Repo.update()
  end

  @doc """
  Deletes a question_suggestion.

  ## Examples

      iex> delete_question_suggestion(question_suggestion)
      {:ok, %QuestionSuggestion{}}

      iex> delete_question_suggestion(question_suggestion)
      {:error, %Ecto.Changeset{}}

  """
  def delete_question_suggestion(%QuestionSuggestion{} = question_suggestion) do
    Repo.delete(question_suggestion)
  end

  @doc """
  Returns an `%Ecto.Changeset{}` for tracking question_suggestion changes.

  ## Examples

      iex> change_question_suggestion(question_suggestion)
      %Ecto.Changeset{data: %QuestionSuggestion{}}

  """
  def change_question_suggestion(%QuestionSuggestion{} = question_suggestion, attrs \\ %{}) do
    QuestionSuggestion.changeset(question_suggestion, attrs)
  end

  @doc """
  Returns the latest suggested question for a user.
  """
  def get_latest_suggestion(user_id) do
    query =
      from qs in QuestionSuggestion,
        join: q in Question,
        on: q.id == qs.id_question,
        where: qs.toia_id == ^user_id,
        where: qs.isPending == true,
        order_by: qs.id_question,
        limit: 1,
        select: %{id_question: qs.id_question, question: q.question, type: q.suggested_type}

    Repo.one(query)
  end

  @doc """
  Returns true if the given user and question pair exists
  """
  def suggestion_exists(user_id, question_id) do
    query =
      from qs in QuestionSuggestion,
        where: qs.toia_id == ^user_id and qs.id_question == ^question_id

    Repo.exists?(query)
  end
end
