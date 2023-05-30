defmodule Toia.ConversationsLogsTest do
  use Toia.DataCase

  alias Toia.ConversationsLogs

  describe "conversations_log" do
    alias Toia.ConversationsLogs.ConversationLog

    import Toia.ConversationsLogsFixtures

    @invalid_attrs %{ada_similarity_score: nil, filler: nil, interactor_id: nil, mode: nil, question_asked: nil, timestamp: nil, video_played: nil}

    test "list_conversations_log/0 returns all conversations_log" do
      conversation_log = conversation_log_fixture()
      assert ConversationsLogs.list_conversations_log() == [conversation_log]
    end

    test "get_conversation_log!/1 returns the conversation_log with given id" do
      conversation_log = conversation_log_fixture()
      assert ConversationsLogs.get_conversation_log!(conversation_log.id) == conversation_log
    end

    test "create_conversation_log/1 with valid data creates a conversation_log" do
      valid_attrs = %{ada_similarity_score: 120.5, filler: true, interactor_id: 42, mode: "some mode", question_asked: "some question_asked", timestamp: 42, video_played: "some video_played"}

      assert {:ok, %ConversationLog{} = conversation_log} = ConversationsLogs.create_conversation_log(valid_attrs)
      assert conversation_log.ada_similarity_score == 120.5
      assert conversation_log.filler == true
      assert conversation_log.interactor_id == 42
      assert conversation_log.mode == "some mode"
      assert conversation_log.question_asked == "some question_asked"
      assert conversation_log.timestamp == 42
      assert conversation_log.video_played == "some video_played"
    end

    test "create_conversation_log/1 with invalid data returns error changeset" do
      assert {:error, %Ecto.Changeset{}} = ConversationsLogs.create_conversation_log(@invalid_attrs)
    end

    test "update_conversation_log/2 with valid data updates the conversation_log" do
      conversation_log = conversation_log_fixture()
      update_attrs = %{ada_similarity_score: 456.7, filler: false, interactor_id: 43, mode: "some updated mode", question_asked: "some updated question_asked", timestamp: 43, video_played: "some updated video_played"}

      assert {:ok, %ConversationLog{} = conversation_log} = ConversationsLogs.update_conversation_log(conversation_log, update_attrs)
      assert conversation_log.ada_similarity_score == 456.7
      assert conversation_log.filler == false
      assert conversation_log.interactor_id == 43
      assert conversation_log.mode == "some updated mode"
      assert conversation_log.question_asked == "some updated question_asked"
      assert conversation_log.timestamp == 43
      assert conversation_log.video_played == "some updated video_played"
    end

    test "update_conversation_log/2 with invalid data returns error changeset" do
      conversation_log = conversation_log_fixture()
      assert {:error, %Ecto.Changeset{}} = ConversationsLogs.update_conversation_log(conversation_log, @invalid_attrs)
      assert conversation_log == ConversationsLogs.get_conversation_log!(conversation_log.id)
    end

    test "delete_conversation_log/1 deletes the conversation_log" do
      conversation_log = conversation_log_fixture()
      assert {:ok, %ConversationLog{}} = ConversationsLogs.delete_conversation_log(conversation_log)
      assert_raise Ecto.NoResultsError, fn -> ConversationsLogs.get_conversation_log!(conversation_log.id) end
    end

    test "change_conversation_log/1 returns a conversation_log changeset" do
      conversation_log = conversation_log_fixture()
      assert %Ecto.Changeset{} = ConversationsLogs.change_conversation_log(conversation_log)
    end
  end
end
