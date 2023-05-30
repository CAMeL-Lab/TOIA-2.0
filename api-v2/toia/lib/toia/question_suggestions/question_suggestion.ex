defmodule Toia.QuestionSuggestions.QuestionSuggestion do
  use Ecto.Schema
  import Ecto.Changeset

  schema "question_suggestions" do
    field :isPending, :boolean, default: true
    field :toia_id, :id
  end

  @doc false
  def changeset(question_suggestion, attrs) do
    question_suggestion
    |> cast(attrs, [:isPending])
    |> validate_required([:isPending])
  end
end
