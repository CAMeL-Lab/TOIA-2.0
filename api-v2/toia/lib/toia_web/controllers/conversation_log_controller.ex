defmodule ToiaWeb.ConversationLogController do
  use ToiaWeb, :controller

  alias Toia.ConversationsLogs
  alias Toia.ConversationsLogs.ConversationLog

  action_fallback ToiaWeb.FallbackController

  def index(conn, _params) do
    conversations_log = ConversationsLogs.list_conversations_log()
    render(conn, :index, conversations_log: conversations_log)
  end

  def create(conn, %{"conversation_log" => conversation_log_params}) do
    with {:ok, %ConversationLog{} = conversation_log} <-
           ConversationsLogs.create_conversation_log(conversation_log_params) do
      conn
      |> put_status(:created)
      |> put_resp_header("location", ~p"/api/conversations_log/#{conversation_log}")
      |> render(:show, conversation_log: conversation_log)
    end
  end

  def show(conn, %{"id" => id}) do
    conversation_log = ConversationsLogs.get_conversation_log!(id)
    render(conn, :show, conversation_log: conversation_log)
  end

  def update(conn, %{"id" => id, "conversation_log" => conversation_log_params}) do
    conversation_log = ConversationsLogs.get_conversation_log!(id)

    with {:ok, %ConversationLog{} = conversation_log} <-
           ConversationsLogs.update_conversation_log(conversation_log, conversation_log_params) do
      render(conn, :show, conversation_log: conversation_log)
    end
  end

  def delete(conn, %{"id" => id}) do
    conversation_log = ConversationsLogs.get_conversation_log!(id)

    with {:ok, %ConversationLog{}} <- ConversationsLogs.delete_conversation_log(conversation_log) do
      send_resp(conn, :no_content, "")
    end
  end
end
