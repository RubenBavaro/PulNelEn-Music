package com.example.pulnelenmusic;

import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;
import java.util.Collections;
import java.util.List;

@WebServlet("/api/playlist")
public class PlaylistAPIServlet extends HttpServlet {
    private PlaylistManager pm = new PlaylistManager("C:\\\\playlists.txt");

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        String user = (String) req.getSession().getAttribute("user");
        String name = req.getParameter("name");
        List<Playlist> pls = pm.getUserPlaylists(user);
        List<Song> songs = pls.stream()
                .filter(p -> p.getName().equals(name))
                .findFirst()
                .map(Playlist::getSongs)
                .orElse(Collections.emptyList());
        resp.setContentType("application/json;charset=UTF-8");
    }
}
