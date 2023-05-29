defmodule Toia.AccountsTest do
  use Toia.DataCase

  alias Toia.Accounts

  describe "toia_users" do
    alias Toia.Accounts.Toia_User

    import Toia.AccountsFixtures

    @invalid_attrs %{email: nil, first_name: nil, language: nil, last_name: nil, password: nil}

    test "list_toia_users/0 returns all toia_users" do
      toia__user = toia__user_fixture()
      assert Accounts.list_toia_users() == [toia__user]
    end

    test "get_toia__user!/1 returns the toia__user with given id" do
      toia__user = toia__user_fixture()
      assert Accounts.get_toia__user!(toia__user.id) == toia__user
    end

    test "create_toia__user/1 with valid data creates a toia__user" do
      valid_attrs = %{email: "some email", first_name: "some first_name", language: "some language", last_name: "some last_name", password: "some password"}

      assert {:ok, %Toia_User{} = toia__user} = Accounts.create_toia__user(valid_attrs)
      assert toia__user.email == "some email"
      assert toia__user.first_name == "some first_name"
      assert toia__user.language == "some language"
      assert toia__user.last_name == "some last_name"
      assert toia__user.password == "some password"
    end

    test "create_toia__user/1 with invalid data returns error changeset" do
      assert {:error, %Ecto.Changeset{}} = Accounts.create_toia__user(@invalid_attrs)
    end

    test "update_toia__user/2 with valid data updates the toia__user" do
      toia__user = toia__user_fixture()
      update_attrs = %{email: "some updated email", first_name: "some updated first_name", language: "some updated language", last_name: "some updated last_name", password: "some updated password"}

      assert {:ok, %Toia_User{} = toia__user} = Accounts.update_toia__user(toia__user, update_attrs)
      assert toia__user.email == "some updated email"
      assert toia__user.first_name == "some updated first_name"
      assert toia__user.language == "some updated language"
      assert toia__user.last_name == "some updated last_name"
      assert toia__user.password == "some updated password"
    end

    test "update_toia__user/2 with invalid data returns error changeset" do
      toia__user = toia__user_fixture()
      assert {:error, %Ecto.Changeset{}} = Accounts.update_toia__user(toia__user, @invalid_attrs)
      assert toia__user == Accounts.get_toia__user!(toia__user.id)
    end

    test "delete_toia__user/1 deletes the toia__user" do
      toia__user = toia__user_fixture()
      assert {:ok, %Toia_User{}} = Accounts.delete_toia__user(toia__user)
      assert_raise Ecto.NoResultsError, fn -> Accounts.get_toia__user!(toia__user.id) end
    end

    test "change_toia__user/1 returns a toia__user changeset" do
      toia__user = toia__user_fixture()
      assert %Ecto.Changeset{} = Accounts.change_toia__user(toia__user)
    end
  end

  describe "stream" do
    alias Toia.Accounts.Stream

    import Toia.AccountsFixtures

    @invalid_attrs %{likes: nil, name: nil, private: nil, views: nil}

    test "list_stream/0 returns all stream" do
      stream = stream_fixture()
      assert Accounts.list_stream() == [stream]
    end

    test "get_stream!/1 returns the stream with given id" do
      stream = stream_fixture()
      assert Accounts.get_stream!(stream.id) == stream
    end

    test "create_stream/1 with valid data creates a stream" do
      valid_attrs = %{likes: 42, name: "some name", private: true, views: 42}

      assert {:ok, %Stream{} = stream} = Accounts.create_stream(valid_attrs)
      assert stream.likes == 42
      assert stream.name == "some name"
      assert stream.private == true
      assert stream.views == 42
    end

    test "create_stream/1 with invalid data returns error changeset" do
      assert {:error, %Ecto.Changeset{}} = Accounts.create_stream(@invalid_attrs)
    end

    test "update_stream/2 with valid data updates the stream" do
      stream = stream_fixture()
      update_attrs = %{likes: 43, name: "some updated name", private: false, views: 43}

      assert {:ok, %Stream{} = stream} = Accounts.update_stream(stream, update_attrs)
      assert stream.likes == 43
      assert stream.name == "some updated name"
      assert stream.private == false
      assert stream.views == 43
    end

    test "update_stream/2 with invalid data returns error changeset" do
      stream = stream_fixture()
      assert {:error, %Ecto.Changeset{}} = Accounts.update_stream(stream, @invalid_attrs)
      assert stream == Accounts.get_stream!(stream.id)
    end

    test "delete_stream/1 deletes the stream" do
      stream = stream_fixture()
      assert {:ok, %Stream{}} = Accounts.delete_stream(stream)
      assert_raise Ecto.NoResultsError, fn -> Accounts.get_stream!(stream.id) end
    end

    test "change_stream/1 returns a stream changeset" do
      stream = stream_fixture()
      assert %Ecto.Changeset{} = Accounts.change_stream(stream)
    end
  end

  describe "stream_view_permission" do
    alias Toia.Accounts.StreamViewPermission

    import Toia.AccountsFixtures

    @invalid_attrs %{}

    test "list_stream_view_permission/0 returns all stream_view_permission" do
      stream_view_permission = stream_view_permission_fixture()
      assert Accounts.list_stream_view_permission() == [stream_view_permission]
    end

    test "get_stream_view_permission!/1 returns the stream_view_permission with given id" do
      stream_view_permission = stream_view_permission_fixture()
      assert Accounts.get_stream_view_permission!(stream_view_permission.id) == stream_view_permission
    end

    test "create_stream_view_permission/1 with valid data creates a stream_view_permission" do
      valid_attrs = %{}

      assert {:ok, %StreamViewPermission{} = stream_view_permission} = Accounts.create_stream_view_permission(valid_attrs)
    end

    test "create_stream_view_permission/1 with invalid data returns error changeset" do
      assert {:error, %Ecto.Changeset{}} = Accounts.create_stream_view_permission(@invalid_attrs)
    end

    test "update_stream_view_permission/2 with valid data updates the stream_view_permission" do
      stream_view_permission = stream_view_permission_fixture()
      update_attrs = %{}

      assert {:ok, %StreamViewPermission{} = stream_view_permission} = Accounts.update_stream_view_permission(stream_view_permission, update_attrs)
    end

    test "update_stream_view_permission/2 with invalid data returns error changeset" do
      stream_view_permission = stream_view_permission_fixture()
      assert {:error, %Ecto.Changeset{}} = Accounts.update_stream_view_permission(stream_view_permission, @invalid_attrs)
      assert stream_view_permission == Accounts.get_stream_view_permission!(stream_view_permission.id)
    end

    test "delete_stream_view_permission/1 deletes the stream_view_permission" do
      stream_view_permission = stream_view_permission_fixture()
      assert {:ok, %StreamViewPermission{}} = Accounts.delete_stream_view_permission(stream_view_permission)
      assert_raise Ecto.NoResultsError, fn -> Accounts.get_stream_view_permission!(stream_view_permission.id) end
    end

    test "change_stream_view_permission/1 returns a stream_view_permission changeset" do
      stream_view_permission = stream_view_permission_fixture()
      assert %Ecto.Changeset{} = Accounts.change_stream_view_permission(stream_view_permission)
    end
  end
end
