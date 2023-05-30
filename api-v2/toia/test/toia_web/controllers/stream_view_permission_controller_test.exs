defmodule ToiaWeb.StreamViewPermissionControllerTest do
  use ToiaWeb.ConnCase

  import Toia.StreamViewPermissionsFixtures

  alias Toia.StreamViewPermissions.StreamViewPermission

  @create_attrs %{

  }
  @update_attrs %{

  }
  @invalid_attrs %{}

  setup %{conn: conn} do
    {:ok, conn: put_req_header(conn, "accept", "application/json")}
  end

  describe "index" do
    test "lists all stream_view_permission", %{conn: conn} do
      conn = get(conn, ~p"/api/stream_view_permission")
      assert json_response(conn, 200)["data"] == []
    end
  end

  describe "create stream_view_permission" do
    test "renders stream_view_permission when data is valid", %{conn: conn} do
      conn = post(conn, ~p"/api/stream_view_permission", stream_view_permission: @create_attrs)
      assert %{"id" => id} = json_response(conn, 201)["data"]

      conn = get(conn, ~p"/api/stream_view_permission/#{id}")

      assert %{
               "id" => ^id
             } = json_response(conn, 200)["data"]
    end

    test "renders errors when data is invalid", %{conn: conn} do
      conn = post(conn, ~p"/api/stream_view_permission", stream_view_permission: @invalid_attrs)
      assert json_response(conn, 422)["errors"] != %{}
    end
  end

  describe "update stream_view_permission" do
    setup [:create_stream_view_permission]

    test "renders stream_view_permission when data is valid", %{conn: conn, stream_view_permission: %StreamViewPermission{id: id} = stream_view_permission} do
      conn = put(conn, ~p"/api/stream_view_permission/#{stream_view_permission}", stream_view_permission: @update_attrs)
      assert %{"id" => ^id} = json_response(conn, 200)["data"]

      conn = get(conn, ~p"/api/stream_view_permission/#{id}")

      assert %{
               "id" => ^id
             } = json_response(conn, 200)["data"]
    end

    test "renders errors when data is invalid", %{conn: conn, stream_view_permission: stream_view_permission} do
      conn = put(conn, ~p"/api/stream_view_permission/#{stream_view_permission}", stream_view_permission: @invalid_attrs)
      assert json_response(conn, 422)["errors"] != %{}
    end
  end

  describe "delete stream_view_permission" do
    setup [:create_stream_view_permission]

    test "deletes chosen stream_view_permission", %{conn: conn, stream_view_permission: stream_view_permission} do
      conn = delete(conn, ~p"/api/stream_view_permission/#{stream_view_permission}")
      assert response(conn, 204)

      assert_error_sent 404, fn ->
        get(conn, ~p"/api/stream_view_permission/#{stream_view_permission}")
      end
    end
  end

  defp create_stream_view_permission(_) do
    stream_view_permission = stream_view_permission_fixture()
    %{stream_view_permission: stream_view_permission}
  end
end
