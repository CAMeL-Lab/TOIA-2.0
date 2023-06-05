defmodule Toia.Questions.Question do
  use Ecto.Schema
  import Ecto.Changeset

  schema "questions" do
    field :onboarding, :boolean, default: false
    field :priority, :integer, default: 100
    field :question, :string
    field :suggested_type, Ecto.Enum, values: [:filler, :greeting, :answer, :exit, :"no-answer", :"y/n-answer"], default: :answer
    field :trigger_suggester, :boolean, default: true
  end

  @doc false
  def changeset(question, attrs) do
    question
    |> cast(attrs, [:question, :suggested_type, :onboarding, :priority, :trigger_suggester])
    |> validate_required([:question, :suggested_type, :onboarding, :priority, :trigger_suggester])
  end
end
