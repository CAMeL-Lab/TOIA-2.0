defmodule Toia.StreamViewPermissionsTest do
  use Toia.DataCase

  alias Toia.StreamViewPermissions

  describe "stream_view_permission" do
    alias Toia.StreamViewPermissions.StreamViewPermission

    import Toia.StreamViewPermissionsFixtures

    @invalid_attrs %{}

    test "list_stream_view_permission/0 returns all stream_view_permission" do
      stream_view_permission = stream_view_permission_fixture()
      assert StreamViewPermissions.list_stream_view_permission() == [stream_view_permission]
    end

    test "get_stream_view_permission!/1 returns the stream_view_permission with given id" do
      stream_view_permission = stream_view_permission_fixture()

      assert StreamViewPermissions.get_stream_view_permission!(stream_view_permission.id) ==
               stream_view_permission
    end

    test "create_stream_view_permission/1 with valid data creates a stream_view_permission" do
      valid_attrs = %{}

      assert {:ok, %StreamViewPermission{} = stream_view_permission} =
               StreamViewPermissions.create_stream_view_permission(valid_attrs)
    end

    test "create_stream_view_permission/1 with invalid data returns error changeset" do
      assert {:error, %Ecto.Changeset{}} =
               StreamViewPermissions.create_stream_view_permission(@invalid_attrs)
    end

    test "update_stream_view_permission/2 with valid data updates the stream_view_permission" do
      stream_view_permission = stream_view_permission_fixture()
      update_attrs = %{}

      assert {:ok, %StreamViewPermission{} = stream_view_permission} =
               StreamViewPermissions.update_stream_view_permission(
                 stream_view_permission,
                 update_attrs
               )
    end

    test "update_stream_view_permission/2 with invalid data returns error changeset" do
      stream_view_permission = stream_view_permission_fixture()

      assert {:error, %Ecto.Changeset{}} =
               StreamViewPermissions.update_stream_view_permission(
                 stream_view_permission,
                 @invalid_attrs
               )

      assert stream_view_permission ==
               StreamViewPermissions.get_stream_view_permission!(stream_view_permission.id)
    end

    test "delete_stream_view_permission/1 deletes the stream_view_permission" do
      stream_view_permission = stream_view_permission_fixture()

      assert {:ok, %StreamViewPermission{}} =
               StreamViewPermissions.delete_stream_view_permission(stream_view_permission)

      assert_raise Ecto.NoResultsError, fn ->
        StreamViewPermissions.get_stream_view_permission!(stream_view_permission.id)
      end
    end

    test "change_stream_view_permission/1 returns a stream_view_permission changeset" do
      stream_view_permission = stream_view_permission_fixture()

      assert %Ecto.Changeset{} =
               StreamViewPermissions.change_stream_view_permission(stream_view_permission)
    end
  end
end
