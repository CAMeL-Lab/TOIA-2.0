defmodule Toia.ToiaUsersTest do
  use Toia.DataCase

  alias Toia.ToiaUsers

  describe "toia_user" do
    alias Toia.ToiaUsers.ToiaUser

    import Toia.ToiaUsersFixtures

    @invalid_attrs %{email: nil, first_name: nil, language: nil, last_name: nil, password: nil}

    test "list_toia_user/0 returns all toia_user" do
      toia_user = toia_user_fixture()
      assert ToiaUsers.list_toia_user() == [toia_user]
    end

    test "get_toia_user!/1 returns the toia_user with given id" do
      toia_user = toia_user_fixture()
      assert ToiaUsers.get_toia_user!(toia_user.id) == toia_user
    end

    test "create_toia_user/1 with valid data creates a toia_user" do
      valid_attrs = %{email: "some email", first_name: "some first_name", language: "some language", last_name: "some last_name", password: "some password"}

      assert {:ok, %ToiaUser{} = toia_user} = ToiaUsers.create_toia_user(valid_attrs)
      assert toia_user.email == "some email"
      assert toia_user.first_name == "some first_name"
      assert toia_user.language == "some language"
      assert toia_user.last_name == "some last_name"
      assert toia_user.password == "some password"
    end

    test "create_toia_user/1 with invalid data returns error changeset" do
      assert {:error, %Ecto.Changeset{}} = ToiaUsers.create_toia_user(@invalid_attrs)
    end

    test "update_toia_user/2 with valid data updates the toia_user" do
      toia_user = toia_user_fixture()
      update_attrs = %{email: "some updated email", first_name: "some updated first_name", language: "some updated language", last_name: "some updated last_name", password: "some updated password"}

      assert {:ok, %ToiaUser{} = toia_user} = ToiaUsers.update_toia_user(toia_user, update_attrs)
      assert toia_user.email == "some updated email"
      assert toia_user.first_name == "some updated first_name"
      assert toia_user.language == "some updated language"
      assert toia_user.last_name == "some updated last_name"
      assert toia_user.password == "some updated password"
    end

    test "update_toia_user/2 with invalid data returns error changeset" do
      toia_user = toia_user_fixture()
      assert {:error, %Ecto.Changeset{}} = ToiaUsers.update_toia_user(toia_user, @invalid_attrs)
      assert toia_user == ToiaUsers.get_toia_user!(toia_user.id)
    end

    test "delete_toia_user/1 deletes the toia_user" do
      toia_user = toia_user_fixture()
      assert {:ok, %ToiaUser{}} = ToiaUsers.delete_toia_user(toia_user)
      assert_raise Ecto.NoResultsError, fn -> ToiaUsers.get_toia_user!(toia_user.id) end
    end

    test "change_toia_user/1 returns a toia_user changeset" do
      toia_user = toia_user_fixture()
      assert %Ecto.Changeset{} = ToiaUsers.change_toia_user(toia_user)
    end
  end
end
