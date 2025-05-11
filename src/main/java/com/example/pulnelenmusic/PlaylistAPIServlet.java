package com.example.pulnelenmusic;

import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.*;
import java.io.IOException;
import java.util.*;

@WebServlet("/api/playlist")
public class PlaylistAPIServlet extends HttpServlet {
    private PlaylistManager pm = new PlaylistManager("C:\\\\playlists.txt");

    // Add this method to handle POST requests
    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        String user = (String) req.getSession().getAttribute("user");
        String playlistName = req.getParameter("name");
        String[] songs = req.getParameterValues("songs");

        if (user == null || playlistName == null || songs == null) {
            resp.sendError(HttpServletResponse.SC_BAD_REQUEST);
            return;
        }

        try {
            Playlist playlist = new Playlist(user, playlistName);
            for (String song : songs) {
                String[] parts = song.split("\\|");
                playlist.addSong(new Song(
                        parts[0],
                        parts.length > 1 ? parts[1] : "",
                        parts.length > 2 ? parts[2] : "",
                        "placeholder.mp4",
                        "static/img/coverSong.png"
                ));
            }

            pm.createPlaylist(playlist);
            resp.getWriter().write("{\"message\":\"Playlist created successfully\"}");
        } catch (Exception e) {
            resp.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
        }
    }

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        String user = (String) req.getSession().getAttribute("user");
        resp.setContentType("application/json;charset=UTF-8");

        try {
            List<Song> defaultSongs = pm.getDefaultSongs();
            StringBuilder json = new StringBuilder("[");
            for (Song song : defaultSongs) {
                json.append(song.toJSON()).append(",");
            }
            if (!defaultSongs.isEmpty()) json.setLength(json.length()-1);
            json.append("]");
            resp.getWriter().write(json.toString());
        } catch (IOException e) {
            resp.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
        }
    }


}