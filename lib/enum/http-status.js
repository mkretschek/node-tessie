'use strict';

/**
 * Defines HTTP status codes in a more readable manner.
 *
 * IMPORTANT: this is not a complete list of status codes, but should cover
 * most of our use cases. See the reference below for a complete list.
 *
 * @enum {number}
 * @see http://www.w3.org/Protocols/rfc2616/rfc2616-sec10.html
 */
exports = module.exports = {
  // Successful ---------------------------------------------------------------

  /** The request has succeeded. */
  OK : 200,

  /**
   * The request has been fulfilled and resulted in a new resource
   * being created.
   */
  CREATED : 201,

  /**
   * The request has been accepted for processing, but the processing has
   * not been completed.
   */
  ACCEPTED : 202,

  /**
   * The server has fulfilled the request but does not need to return an
   * entity body, and might want to return updated metainformation.
   */
  NO_CONTENT : 204,


  // Redirection --------------------------------------------------------------

  /**
   * The requested resource corresponds to any one of a set of representations,
   * each with its own specific location, and agent-driven negotiation
   * information (section 12) is being provided so that the user (or user
   * agent) can select a preferred representation and redirect its request to
   * that location.
   */
  MULTIPLE_CHOICES : 300,

  /**
   * The requested resource has been assigned a new permanent URI and any
   * future references to this resource SHOULD use one of the returned URIs.
   */
  MOVED_PERMANENTLY : 301,

  /**
   * The requested resource resides temporarily under a different URI.
   */
  FOUND : 302,

  /**
   * The response to the request can be found under a different URI and SHOULD
   * be retrieved using a GET method on that resource.
   */
  SEE_OTHER : 303,

  /**
   * If the client has performed a conditional GET request and access is
   * allowed, but the document has not been modified, the server SHOULD
   * respond with this status code.
   */
  NOT_MODIFIED : 304,

  /**
   * The requested resource resides temporarily under a different URI.
   */
  TEMPORARY_REDIRECT : 307,


  // Client error -------------------------------------------------------------

  /**
   * The request could not be understood by the server due to malformed syntax.
   */
  BAD_REQUEST : 400,

  /**
   * The request requires user authentication.
   * @see Description in W3C's RFC2616 regarding this code and its
   * requirements.
   */
  UNAUTHORIZED : 401,

  /**
   * This code is reserved for future use.
   */
  PAYMENT_REQUIRED : 402,

  /**
   * The server understood the request, but is refusing to fulfill it.
   * Authorization will not help and the request SHOULD NOT be repeated.
   */
  FORBIDDEN : 403,

  /**
   * The server has not found anything matching the Request-URI.
   */
  NOT_FOUND : 404,

  /**
   * The method specified in the Request-Line is not allowed for the resource
   * identified by the Request-URI.
   */
  METHOD_NOT_ALLOWED : 405,

  /**
   * The resource identified by the request is only capable of generating
   * response entities which have content characteristics not acceptable
   * according to the accept headers sent in the request.
   */
  NOT_ACCEPTABLE : 406,

  /**
   * The client did not produce a request within the time that the server
   * was prepared to wait.
   */
  REQUEST_TIMEOUT : 408,

  /**
   * The requested resource is no longer available at the server and no
   * forwarding address is known.
   */
  GONE : 410,


  // Server Error -------------------------------------------------------------

  /**
   * The server encountered an unexpected condition which prevented it from
   * fulfilling the request.
   */
  INTERNAL_SERVER_ERROR : 500,

  /**
   * The server does not support the functionality required to fulfill the
   * request.
   */
  NOT_IMPLEMENTED : 501,

  /**
   * The server, while acting as a gateway or proxy, received an invalid
   * response from the upstream server it accessed in attempting to fulfill
   * the request.
   */
  BAD_GATEWAY : 502,

  /**
   * The server is currently unable to handle the request due to a temporary
   * overloading or maintenance of the server.
   */
  SERVICE_UNAVAILABLE : 503,

  /**
   * The server, while acting as a gateway or proxy, did not receive a timely
   * response from the upstream server specified by the URI (e.g. HTTP, FTP,
   * LDAP) or some other auxiliary server (e.g. DNS) it needed to access in
   * attempting to complete the request.
   */
  GATEWAY_TIMEOUT : 504
};