package com.example.pulnelenmusic;

import java.io.IOException;
import java.io.PrintWriter;
import java.util.List;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.*;

@WebServlet("/playlist-servlet")
public class PlaylistServlet extends HttpServlet {
    private static final String PLAYLIST_FILE = "C:\\\\playlists.txt";
    private final PlaylistManager playlistManager = new PlaylistManager(PLAYLIST_FILE);

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        String user = (String) req.getSession().getAttribute("user");
        List<Playlist> playlists = playlistManager.getUserPlaylists(user);

        resp.setContentType("text/html;charset=UTF-8");
        PrintWriter out = resp.getWriter();
        out.println("<html><body><h1>Playlist di " + user + "</h1>");
        for (Playlist pl : playlists) {
            out.println("<h2>" + pl.getName() + "</h2><ul>");
            for (Song s : pl.getSongs()) {
                out.println("<li>"
                        + s.getTitle() + " - " + s.getArtist() + " (" + s.getGenre() + ") "
                        + "<form method='post' action='removeSong' style='display:inline;'>"
                        + "<input type='hidden' name='playlist' value='" + pl.getName() + "'/>"
                        + "<input type='hidden' name='title'    value='" + s.getTitle() + "'/>"
                        + "<button type='submit'>Rimuovi</button>"
                        + "</form></li>");
            }
            out.println("</ul>");
        }
        out.println("<a href='index.html'>Torna Home</a></body></html>");
    }
}
