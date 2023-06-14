defmodule Toia.ConversationsLogs.ConversationLog do
  use Ecto.Schema
  import Ecto.Changeset

  schema "conversations_log" do
    field :ada_similarity_score, :float, default: nil
    field :filler, :boolean, default: true
    field :interactor_id, :integer, default: nil
    field :mode, :string, default: nil
    field :question_asked, :string
    field :timestamp, :integer
    field :video_played, :string
    field :toia_id, :id
  end

  @doc false
  def changeset(conversation_log, attrs) do
    conversation_log
    |> cast(attrs, [
      :interactor_id,
      :timestamp,
      :filler,
      :question_asked,
      :video_played,
      :ada_similarity_score,
      :mode
    ])
    |> validate_required([
      :interactor_id,
      :timestamp,
      :filler,
      :question_asked,
      :video_played,
      :ada_similarity_score,
      :mode
    ])
  end
end
