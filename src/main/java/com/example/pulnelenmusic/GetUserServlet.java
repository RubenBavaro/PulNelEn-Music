package com.example.pulnelenmusic;

import java.io.*;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.*;

@WebServlet("/getUser")
public class GetUserServlet extends HttpServlet {
    private static final String LOGIN_FILE = "C:\\\\login.txt";

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        resp.setContentType("text/plain;charset=UTF-8");
        try (BufferedReader reader = new BufferedReader(new FileReader(LOGIN_FILE))) {
            String user = reader.readLine();
            resp.getWriter().write(user != null ? user : "Log In");
        } catch (IOException e) {
            resp.getWriter().write("Log In");
        }
    }
}
