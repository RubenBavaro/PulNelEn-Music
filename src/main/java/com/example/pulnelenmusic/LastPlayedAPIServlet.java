package com.example.pulnelenmusic;

import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.*;
import java.io.IOException;

@WebServlet("/api/playlist/last-played")
public class LastPlayedAPIServlet extends HttpServlet {
    private PlaylistManager pm = new PlaylistManager("C:\\\\playlists.txt");

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        String user = (String) req.getSession().getAttribute("user");
        String title = req.getParameter("title");
        String artist = req.getParameter("artist");
        String genre = req.getParameter("genre");
        String filePath = req.getParameter("filePath");
        String coverPath = req.getParameter("coverPath");

        try {
            pm.updateLastPlayed(user, new Song(title, artist, genre, filePath, coverPath));
            resp.setStatus(HttpServletResponse.SC_OK);
        } catch (IOException e) {
            resp.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
        }
    }
}
