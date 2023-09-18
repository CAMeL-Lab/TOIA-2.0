defmodule Toia.PlayerFeedbacksTest do
  use Toia.DataCase

  alias Toia.PlayerFeedbacks

  describe "player_feedback" do
    alias Toia.PlayerFeedbacks.PlayerFeedback

    import Toia.PlayerFeedbacksFixtures

    @invalid_attrs %{question: nil, rating: nil, video_id: nil}

    test "list_player_feedback/0 returns all player_feedback" do
      player_feedback = player_feedback_fixture()
      assert PlayerFeedbacks.list_player_feedback() == [player_feedback]
    end

    test "get_player_feedback!/1 returns the player_feedback with given id" do
      player_feedback = player_feedback_fixture()
      assert PlayerFeedbacks.get_player_feedback!(player_feedback.id) == player_feedback
    end

    test "create_player_feedback/1 with valid data creates a player_feedback" do
      valid_attrs = %{question: "some question", rating: 42, video_id: "some video_id"}

      assert {:ok, %PlayerFeedback{} = player_feedback} =
               PlayerFeedbacks.create_player_feedback(valid_attrs)

      assert player_feedback.question == "some question"
      assert player_feedback.rating == 42
      assert player_feedback.video_id == "some video_id"
    end

    test "create_player_feedback/1 with invalid data returns error changeset" do
      assert {:error, %Ecto.Changeset{}} = PlayerFeedbacks.create_player_feedback(@invalid_attrs)
    end

    test "update_player_feedback/2 with valid data updates the player_feedback" do
      player_feedback = player_feedback_fixture()

      update_attrs = %{
        question: "some updated question",
        rating: 43,
        video_id: "some updated video_id"
      }

      assert {:ok, %PlayerFeedback{} = player_feedback} =
               PlayerFeedbacks.update_player_feedback(player_feedback, update_attrs)

      assert player_feedback.question == "some updated question"
      assert player_feedback.rating == 43
      assert player_feedback.video_id == "some updated video_id"
    end

    test "update_player_feedback/2 with invalid data returns error changeset" do
      player_feedback = player_feedback_fixture()

      assert {:error, %Ecto.Changeset{}} =
               PlayerFeedbacks.update_player_feedback(player_feedback, @invalid_attrs)

      assert player_feedback == PlayerFeedbacks.get_player_feedback!(player_feedback.id)
    end

    test "delete_player_feedback/1 deletes the player_feedback" do
      player_feedback = player_feedback_fixture()
      assert {:ok, %PlayerFeedback{}} = PlayerFeedbacks.delete_player_feedback(player_feedback)

      assert_raise Ecto.NoResultsError, fn ->
        PlayerFeedbacks.get_player_feedback!(player_feedback.id)
      end
    end

    test "change_player_feedback/1 returns a player_feedback changeset" do
      player_feedback = player_feedback_fixture()
      assert %Ecto.Changeset{} = PlayerFeedbacks.change_player_feedback(player_feedback)
    end
  end
end
