defmodule Toia.ConversationsLogs do
  @moduledoc """
  The ConversationsLogs context.
  """

  import Ecto.Query, warn: false
  alias Toia.Repo

  alias Toia.ConversationsLogs.ConversationLog

  @doc """
  Returns the list of conversations_log.

  ## Examples

      iex> list_conversations_log()
      [%ConversationLog{}, ...]

  """
  def list_conversations_log do
    Repo.all(ConversationLog)
  end

  @doc """
  Gets a single conversation_log.

  Raises `Ecto.NoResultsError` if the Conversation log does not exist.

  ## Examples

      iex> get_conversation_log!(123)
      %ConversationLog{}

      iex> get_conversation_log!(456)
      ** (Ecto.NoResultsError)

  """
  def get_conversation_log!(id), do: Repo.get!(ConversationLog, id)

  @doc """
  Creates a conversation_log.

  ## Examples

      iex> create_conversation_log(%{field: value})
      {:ok, %ConversationLog{}}

      iex> create_conversation_log(%{field: bad_value})
      {:error, %Ecto.Changeset{}}

  """
  def create_conversation_log(attrs \\ %{}) do
    %ConversationLog{}
    |> ConversationLog.changeset(attrs)
    |> Repo.insert()
  end

  @doc """
  Updates a conversation_log.

  ## Examples

      iex> update_conversation_log(conversation_log, %{field: new_value})
      {:ok, %ConversationLog{}}

      iex> update_conversation_log(conversation_log, %{field: bad_value})
      {:error, %Ecto.Changeset{}}

  """
  def update_conversation_log(%ConversationLog{} = conversation_log, attrs) do
    conversation_log
    |> ConversationLog.changeset(attrs)
    |> Repo.update()
  end

  @doc """
  Deletes a conversation_log.

  ## Examples

      iex> delete_conversation_log(conversation_log)
      {:ok, %ConversationLog{}}

      iex> delete_conversation_log(conversation_log)
      {:error, %Ecto.Changeset{}}

  """
  def delete_conversation_log(%ConversationLog{} = conversation_log) do
    Repo.delete(conversation_log)
  end

  @doc """
  Returns an `%Ecto.Changeset{}` for tracking conversation_log changes.

  ## Examples

      iex> change_conversation_log(conversation_log)
      %Ecto.Changeset{data: %ConversationLog{}}

  """
  def change_conversation_log(%ConversationLog{} = conversation_log, attrs \\ %{}) do
    ConversationLog.changeset(conversation_log, attrs)
  end
end
