defmodule Toia.StreamsTest do
  use Toia.DataCase

  alias Toia.Streams

  describe "stream" do
    alias Toia.Streams.Stream

    import Toia.StreamsFixtures

    @invalid_attrs %{likes: nil, name: nil, private: nil, views: nil}

    test "list_stream/0 returns all stream" do
      stream = stream_fixture()
      assert Streams.list_stream() == [stream]
    end

    test "get_stream!/1 returns the stream with given id" do
      stream = stream_fixture()
      assert Streams.get_stream!(stream.id) == stream
    end

    test "create_stream/1 with valid data creates a stream" do
      valid_attrs = %{likes: 42, name: "some name", private: true, views: 42}

      assert {:ok, %Stream{} = stream} = Streams.create_stream(valid_attrs)
      assert stream.likes == 42
      assert stream.name == "some name"
      assert stream.private == true
      assert stream.views == 42
    end

    test "create_stream/1 with invalid data returns error changeset" do
      assert {:error, %Ecto.Changeset{}} = Streams.create_stream(@invalid_attrs)
    end

    test "update_stream/2 with valid data updates the stream" do
      stream = stream_fixture()
      update_attrs = %{likes: 43, name: "some updated name", private: false, views: 43}

      assert {:ok, %Stream{} = stream} = Streams.update_stream(stream, update_attrs)
      assert stream.likes == 43
      assert stream.name == "some updated name"
      assert stream.private == false
      assert stream.views == 43
    end

    test "update_stream/2 with invalid data returns error changeset" do
      stream = stream_fixture()
      assert {:error, %Ecto.Changeset{}} = Streams.update_stream(stream, @invalid_attrs)
      assert stream == Streams.get_stream!(stream.id)
    end

    test "delete_stream/1 deletes the stream" do
      stream = stream_fixture()
      assert {:ok, %Stream{}} = Streams.delete_stream(stream)
      assert_raise Ecto.NoResultsError, fn -> Streams.get_stream!(stream.id) end
    end

    test "change_stream/1 returns a stream changeset" do
      stream = stream_fixture()
      assert %Ecto.Changeset{} = Streams.change_stream(stream)
    end
  end
end
