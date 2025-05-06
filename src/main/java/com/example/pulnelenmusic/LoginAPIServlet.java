package com.example.pulnelenmusic;

import java.io.*;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.*;

@WebServlet("/api/login")
public class LoginAPIServlet extends HttpServlet {
    private static final String LOGIN_FILE = "C:\\\\login.txt";
    private final LoginManager loginManager = new LoginManager(LOGIN_FILE);

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        String username = req.getParameter("username");
        String password = req.getParameter("password");
        boolean first = loginManager.isFirstLogin();
        boolean valid = first
                ? "4ITIA123".equals(password)
                : loginManager.validateLogin(username, password);

        resp.setContentType("application/json;charset=UTF-8");
        if (valid) {
            // salva solo lo username
            loginManager.registerFirstUser(username);
            req.getSession().setAttribute("user", username);
            resp.getWriter().write("{\"success\":true}");
        } else {
            resp.setStatus(401);
            resp.getWriter().write("{\"success\":false}");
        }
    }
}
