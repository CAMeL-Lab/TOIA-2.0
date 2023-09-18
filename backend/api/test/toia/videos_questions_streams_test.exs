defmodule Toia.VideosQuestionsStreamsTest do
  use Toia.DataCase

  alias Toia.VideosQuestionsStreams

  describe "videos_questions_streams" do
    alias Toia.VideosQuestionsStreams.VideoQuestionStream

    import Toia.VideosQuestionsStreamsFixtures

    @invalid_attrs %{ada_search: nil, type: nil}

    test "list_videos_questions_streams/0 returns all videos_questions_streams" do
      video_question_stream = video_question_stream_fixture()
      assert VideosQuestionsStreams.list_videos_questions_streams() == [video_question_stream]
    end

    test "get_video_question_stream!/1 returns the video_question_stream with given id" do
      video_question_stream = video_question_stream_fixture()

      assert VideosQuestionsStreams.get_video_question_stream!(video_question_stream.id) ==
               video_question_stream
    end

    test "create_video_question_stream/1 with valid data creates a video_question_stream" do
      valid_attrs = %{ada_search: "some ada_search", type: :filler}

      assert {:ok, %VideoQuestionStream{} = video_question_stream} =
               VideosQuestionsStreams.create_video_question_stream(valid_attrs)

      assert video_question_stream.ada_search == "some ada_search"
      assert video_question_stream.type == :filler
    end

    test "create_video_question_stream/1 with invalid data returns error changeset" do
      assert {:error, %Ecto.Changeset{}} =
               VideosQuestionsStreams.create_video_question_stream(@invalid_attrs)
    end

    test "update_video_question_stream/2 with valid data updates the video_question_stream" do
      video_question_stream = video_question_stream_fixture()
      update_attrs = %{ada_search: "some updated ada_search", type: :greeting}

      assert {:ok, %VideoQuestionStream{} = video_question_stream} =
               VideosQuestionsStreams.update_video_question_stream(
                 video_question_stream,
                 update_attrs
               )

      assert video_question_stream.ada_search == "some updated ada_search"
      assert video_question_stream.type == :greeting
    end

    test "update_video_question_stream/2 with invalid data returns error changeset" do
      video_question_stream = video_question_stream_fixture()

      assert {:error, %Ecto.Changeset{}} =
               VideosQuestionsStreams.update_video_question_stream(
                 video_question_stream,
                 @invalid_attrs
               )

      assert video_question_stream ==
               VideosQuestionsStreams.get_video_question_stream!(video_question_stream.id)
    end

    test "delete_video_question_stream/1 deletes the video_question_stream" do
      video_question_stream = video_question_stream_fixture()

      assert {:ok, %VideoQuestionStream{}} =
               VideosQuestionsStreams.delete_video_question_stream(video_question_stream)

      assert_raise Ecto.NoResultsError, fn ->
        VideosQuestionsStreams.get_video_question_stream!(video_question_stream.id)
      end
    end

    test "change_video_question_stream/1 returns a video_question_stream changeset" do
      video_question_stream = video_question_stream_fixture()

      assert %Ecto.Changeset{} =
               VideosQuestionsStreams.change_video_question_stream(video_question_stream)
    end
  end
end
