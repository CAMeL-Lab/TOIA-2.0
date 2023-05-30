defmodule Toia.QuestionSuggestions do
  @moduledoc """
  The QuestionSuggestions context.
  """

  import Ecto.Query, warn: false
  alias Toia.Repo

  alias Toia.QuestionSuggestions.QuestionSuggestion

  @doc """
  Returns the list of question_suggestions.

  ## Examples

      iex> list_question_suggestions()
      [%QuestionSuggestion{}, ...]

  """
  def list_question_suggestions do
    Repo.all(QuestionSuggestion)
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
  def create_question_suggestion(attrs \\ %{}) do
    %QuestionSuggestion{}
    |> QuestionSuggestion.changeset(attrs)
    |> Repo.insert()
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
end
