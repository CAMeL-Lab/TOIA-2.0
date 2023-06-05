defmodule Toia.QuestionSuggestions.QuestionSuggestion do
  use Ecto.Schema
  import Ecto.Changeset

  @primary_key false

  schema "question_suggestions" do
    field :isPending, :boolean, default: true
    field :toia_id, :id, primary_key: true
    field :id_question, :id, primary_key: true
  end

  @doc false
  def changeset(question_suggestion, attrs) do
    question_suggestion
    |> cast(attrs, [:toia_id, :id_question, :isPending])
    |> validate_required([:toia_id, :id_question, :isPending])
  end
end
