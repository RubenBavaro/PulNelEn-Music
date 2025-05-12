package com.example.pulnelenmusic;

import com.google.gson.Gson;
import com.google.gson.JsonObject;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;

@WebServlet(name = "PlaylistAPIServlet", value = "api/playlist")
public class PlaylistAPIServlet extends HttpServlet {
    private final PlaylistManager pm = new PlaylistManager("C:\\\\playlists.txt");
    private final Gson gson = new Gson();

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        resp.setContentType("application/json;charset=UTF-8");
        String user = (String) req.getSession().getAttribute("user");

        try {
            // 1) Parse JSON request-body
            JsonObject body = gson.fromJson(req.getReader(), JsonObject.class);
            if (body == null || !body.has("name")) {
                resp.sendError(HttpServletResponse.SC_BAD_REQUEST, "Richiesta malformata");
                return;
            }
            String playlistName = body.get("name").getAsString();

            // 2) Create new (empty) playlist
            Playlist newPlaylist = new Playlist(user, playlistName);

            // 3) Persist it
            pm.addPlaylist(newPlaylist);

            // 4) Return empty array as “success” for the frontend
            resp.getWriter().write("[]");
        } catch (Exception e) {
            e.printStackTrace();
            resp.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR,
                    "Errore nel salvataggio della playlist");
        }
    }
}
