package com.example.pulnelenmusic;

import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.*;
import java.io.IOException;

@WebServlet("/api/playlist/add")
public class AddSongAPIServlet extends HttpServlet {
    private PlaylistManager pm = new PlaylistManager("C:\\\\playlists.txt");

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        String user = (String) req.getSession().getAttribute("user");
        String plName = req.getParameter("name");
        String title = req.getParameter("song");
        String artist = req.getParameter("artist");
        String genre = req.getParameter("genre");

        try {
            pm.addSongToPlaylist(user, plName, new Song(title, artist, genre, "placeholder.mp4", "static/img/coverSong.png"));
            resp.getWriter().write("{\"status\":\"success\"}");
        } catch (IOException e) {
            resp.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
        }
    }
}