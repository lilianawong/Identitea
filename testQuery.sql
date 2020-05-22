-- SQLite

/*RESET*/
/*
DELETE FROM post;

DELETE FROM auth_user;
DELETE FROM py4web_session;
*/


/*post*/
SELECT * FROM post;
SELECT * FROM auth_user;

/*post and author grouped by parent and reverse date*/
SELECT post.id,
        post.email,
        post.content,
        post.post_date,
        auth_user.first_name || ' ' || auth_user.last_name as author,
        post.is_reply,
        IFNULL(post.is_reply*2,1 + 2 * post.id) as sort,
        (SELECT COUNT(*) FROM post AS p WHERE post.id = p.is_reply) as children
        FROM post 
        LEFT JOIN auth_user ON post.email = auth_user.email
        ORDER BY sort DESC, post.post_date DESC;

/*post and author grouped by parent and date*/
SELECT post.id,
        post.email,
        post.content,
        post.post_date,
        auth_user.first_name || ' ' || auth_user.last_name as author,
        post.is_reply,
        IFNULL(post.is_reply, post.id) as sort,
        (SELECT COUNT(*) FROM post AS p WHERE post.id = p.is_reply) as children
        FROM post
        LEFT JOIN auth_user ON post.email = auth_user.email
        ORDER BY sort, post.post_date;