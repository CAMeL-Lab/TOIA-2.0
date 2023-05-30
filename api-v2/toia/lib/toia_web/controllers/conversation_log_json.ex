defmodule ToiaWeb.ConversationLogJSON do
  alias Toia.ConversationsLogs.ConversationLog

  @doc """
  Renders a list of conversations_log.
  """
  def index(%{conversations_log: conversations_log}) do
    %{data: for(conversation_log <- conversations_log, do: data(conversation_log))}
  end

  @doc """
  Renders a single conversation_log.
  """
  def show(%{conversation_log: conversation_log}) do
    %{data: data(conversation_log)}
  end

  defp data(%ConversationLog{} = conversation_log) do
    %{
      id: conversation_log.id,
      interactor_id: conversation_log.interactor_id,
      timestamp: conversation_log.timestamp,
      filler: conversation_log.filler,
      question_asked: conversation_log.question_asked,
      video_played: conversation_log.video_played,
      ada_similarity_score: conversation_log.ada_similarity_score,
      mode: conversation_log.mode
    }
  end
end
